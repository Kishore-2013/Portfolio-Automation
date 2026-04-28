/**
 * PreviewDevManager
 * -----------------
 * Manages per-project dev server processes (Vite or Next.js) so that:
 *   GET /preview/:projectId  →  proxy to the local dev server running for that project
 *
 * Reliability features:
 *   - Auto-restart on crash (up to MAX_RESTARTS times, with exponential back-off)
 *   - Health-ping loop every HEALTH_CHECK_INTERVAL_MS to detect zombie ports
 *   - getDevServerStatus() exposes fine-grained state to callers
 */

import { ChildProcess, spawn, execSync } from 'child_process';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
import { injectPortfolioData } from './portfolio-data-injector';

const IDLE_MS                  = 10 * 60 * 1000; // 10 min idle → kill
const READY_TIMEOUT_MS         = 120_000;         // max wait for port to open
const INSTALL_TIMEOUT          = 180_000;         // max npm install wait (3 min)
const PORT_START               = 5100;
const PORT_END                 = 5200;
const MAX_RESTARTS             = 100;              // max automatic restarts per project
const RESTART_DELAY_BASE_MS    = 2_000;           // base delay before restart (doubles each attempt)
const HEALTH_CHECK_INTERVAL_MS = 30_000;          // how often to TCP-probe all running servers

export type DevServerState = 'starting' | 'running' | 'crashed' | 'idle';

interface DevEntry {
  process:      ChildProcess;
  port:         number;
  projectId:    string;
  diskPath:     string;
  lastUsed:     number;
  ready:        boolean;
  readyPromise: Promise<void>;
  type:         'vite' | 'next';
  restartCount: number;
  state:        DevServerState;
}

// projectId → running entry
const entries = new Map<string, DevEntry>();

// projectId → in-progress spawn promise
const spawning = new Map<string, Promise<number>>();

// projectId → restart timer (so we can cancel if killed manually)
const restartTimers = new Map<string, ReturnType<typeof setTimeout>>();

// ── Port helpers ────────────────────────────────────────────────────────────

function usedPorts(): Set<number> {
  return new Set([...entries.values()].map(e => e.port));
}

async function isFree(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}

async function allocatePort(): Promise<number> {
  const used = usedPorts();
  for (let p = PORT_START; p <= PORT_END; p++) {
    if (!used.has(p) && await isFree(p)) return p;
  }
  throw new Error('No free preview ports available (5100–5200 exhausted)');
}

// ── TCP probe ────────────────────────────────────────────────────────────────

function tcpProbe(port: number, timeoutMs = 2000): Promise<boolean> {
  return new Promise(resolve => {
    const sock = net.createConnection({ port, host: '127.0.0.1' });
    const timer = setTimeout(() => { sock.destroy(); resolve(false); }, timeoutMs);
    sock.once('connect', () => { clearTimeout(timer); sock.destroy(); resolve(true); });
    sock.once('error',   () => { clearTimeout(timer); resolve(false); });
  });
}

// ── Async npm install ────────────────────────────────────────────────────────

function runNpmInstall(appPath: string, projectId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`[PREVIEW_DEV] 📦 Running npm install for project ${projectId}...`);

    const isWin = process.platform === 'win32';

    const proc = spawn(
      isWin ? 'npm.cmd' : 'npm',
      ['install', '--legacy-peer-deps', '--prefer-offline'],
      {
        cwd:   appPath,
        shell: isWin,
        stdio: 'pipe',
        env:   { ...process.env },
      }
    );

    const stderr: string[] = [];
    proc.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error(`npm install timed out after ${INSTALL_TIMEOUT / 1000}s for project ${projectId}`));
    }, INSTALL_TIMEOUT);

    proc.once('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        console.log(`[PREVIEW_DEV] ✅ npm install done for project ${projectId}`);
        resolve();
      } else {
        const msg = stderr.join('').slice(-1000).trim();
        reject(new Error(`npm install failed (exit ${code}) for project ${projectId}: ${msg}`));
      }
    });

    proc.once('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`npm install spawn error for project ${projectId}: ${err.message}`));
    });
  });
}

// ── Wait for port to open ────────────────────────────────────────────────────

function waitForPort(port: number, timeoutMs = READY_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const attempt = () => {
      const sock = net.createConnection({ port, host: '127.0.0.1' });
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() >= deadline) {
          reject(new Error(`Dev server on port ${port} did not become ready within ${timeoutMs / 1000}s`));
        } else {
          setTimeout(attempt, 800);
        }
      });
    };
    attempt();
  });
}

// ── Schedule restart after a crash ──────────────────────────────────────────

function scheduleRestart(projectId: string, diskPath: string, restartCount: number): void {
  if (restartCount >= MAX_RESTARTS) {
    console.warn(`[PREVIEW_DEV] ⚠️  Project ${projectId} exceeded max restarts (${MAX_RESTARTS}). Giving up.`);
    // Mark state as crashed so status API reflects it
    const entry = entries.get(projectId);
    if (entry) entry.state = 'crashed';
    return;
  }

  const delay = RESTART_DELAY_BASE_MS * Math.pow(2, restartCount); // 2s, 4s, 8s
  console.log(`[PREVIEW_DEV] 🔄 Scheduling restart #${restartCount + 1} for project ${projectId} in ${delay}ms...`);

  const timer = setTimeout(async () => {
    restartTimers.delete(projectId);
    // Don't restart if someone already manually killed or restarted
    if (entries.has(projectId) || spawning.has(projectId)) {
      console.log(`[PREVIEW_DEV] ↩  Restart for ${projectId} cancelled — already running/starting.`);
      return;
    }
    try {
      console.log(`[PREVIEW_DEV] 🔁 Auto-restarting dev server for project ${projectId} (attempt ${restartCount + 1})`);
      const promise = spawnDevServer(projectId, diskPath, restartCount + 1).finally(() => {
        spawning.delete(projectId);
      });
      spawning.set(projectId, promise);
      await promise;
    } catch (err: any) {
      console.error(`[PREVIEW_DEV] ❌ Auto-restart #${restartCount + 1} failed for ${projectId}: ${err.message}`);
      scheduleRestart(projectId, diskPath, restartCount + 1);
    }
  }, delay);

  restartTimers.set(projectId, timer);
}

// ── Spawn dev server ─────────────────────────────────────────────────────────

async function spawnDevServer(
  projectId: string,
  diskPath: string,
  restartCount = 0,
): Promise<number> {
  const isWin = process.platform === 'win32';

  if (!fs.existsSync(diskPath)) {
    throw new Error(`Portfolio source folder not found: ${diskPath}`);
  }

  // Support for templates where the frontend app is in a 'web' subdirectory
  const appPath = fs.existsSync(path.join(diskPath, 'web')) 
    ? path.join(diskPath, 'web') 
    : diskPath;

  // 1. Auto-install node_modules if missing
  const nmPath = path.join(appPath, 'node_modules');
  if (!fs.existsSync(nmPath)) {
    await runNpmInstall(appPath, projectId);
  }

  // 2. Inject portfolio data
  try {
    // We pass appPath so data is written to the correct public/ folder for the dev server
    await injectPortfolioData(projectId, appPath);
  } catch (err: any) {
    console.warn(`[PREVIEW_DEV] Could not inject portfolio data for ${projectId}:`, err.message);
  }

  // 3. Detect framework
  let projectType: 'vite' | 'next' = 'vite';
  let binName = 'vite';
  let args: string[] = [];

  const pkgPath = path.join(appPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.dependencies?.next || pkg.devDependencies?.next) {
      projectType = 'next';
      binName = 'next';
    }
  }

  const port = await allocatePort();
  const binPathBase = path.join(appPath, 'node_modules', '.bin', binName);
  const binPath = isWin ? binPathBase + '.cmd' : binPathBase;

  if (!fs.existsSync(binPath)) {
    throw new Error(`${binName} binary not found at ${binPath}. Re-run npm install.`);
  }

  if (projectType === 'next') {
    args = ['dev', '--port', String(port), '--hostname', '0.0.0.0'];
  } else {
    args = ['--port', String(port), '--host', '0.0.0.0', '--strictPort', '--logLevel', 'warn'];
  }

  console.log(`[PREVIEW_DEV] 🚀 Spawning ${projectType.toUpperCase()} for project ${projectId} on port ${port} (restart #${restartCount})`);

  // Kill anything already on this port
  try {
    if (isWin) {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== process.pid.toString()) {
            console.log(`[PREVIEW_DEV] 🔫 Killing stale process ${pid} on port ${port}`);
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          }
        }
      }
    }
  } catch (e) { /* ignore */ }

  const proc = spawn(binPath, args, {
    cwd:   appPath,
    shell: isWin,
    stdio: ['ignore', 'pipe', 'pipe'],
    env:   { ...process.env, BROWSER: 'none', PORT: String(port), NODE_ENV: 'development' },
  });

  proc.stdout?.on('data', (d: Buffer) =>
    console.log(`[PREVIEW_DEV:${projectId}] ${d.toString().trimEnd()}`));
  proc.stderr?.on('data', (d: Buffer) =>
    console.error(`[PREVIEW_DEV:${projectId}] ${d.toString().trimEnd()}`));

  const readyPromise = waitForPort(port).then(() => {
    const entry = entries.get(projectId);
    if (entry) { entry.ready = true; entry.state = 'running'; }
    console.log(`[PREVIEW_DEV] ✅ ${projectType.toUpperCase()} ready: project ${projectId} → port ${port}`);
  }).catch((err) => {
    console.error(`[PREVIEW_DEV] ❌ Port timeout for project ${projectId}. Killing process.`);
    try { proc.kill('SIGKILL'); } catch {}
    entries.delete(projectId);
    entries.delete(projectId);
    spawning.delete(projectId);
    throw err;
  });

  const entry: DevEntry = {
    process:      proc,
    port,
    projectId,
    diskPath,
    lastUsed:     Date.now(),
    ready:        false,
    readyPromise,
    type:         projectType,
    restartCount,
    state:        'starting',
  };
  entries.set(projectId, entry);

  proc.once('exit', (code, signal) => {
    const isManualKill = signal === 'SIGKILL' || signal === 'SIGTERM';
    console.warn(
      `[PREVIEW_DEV] ${projectType.toUpperCase()} exited for project ${projectId}` +
      ` (code=${code}, signal=${signal})`
    );

    entries.delete(projectId);
    spawning.delete(projectId);

    // Auto-restart unless manually killed or max restarts exceeded
    if (!isManualKill) {
      scheduleRestart(projectId, diskPath, restartCount);
    }
  });

  await readyPromise;
  return port;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getOrSpawnDevServer(projectId: string, diskPath: string): Promise<number> {
  const existing = entries.get(projectId);
  if (existing && !existing.process.killed) {
    existing.lastUsed = Date.now();
    await existing.readyPromise;
    return existing.port;
  }

  const inProgress = spawning.get(projectId);
  if (inProgress) return inProgress;

  const promise = spawnDevServer(projectId, diskPath).finally(() => {
    spawning.delete(projectId);
  });

  spawning.set(projectId, promise);
  return promise;
}

export function getRunningPort(projectId: string): number | null {
  const entry = entries.get(projectId);
  if (entry && !entry.process.killed && entry.ready) return entry.port;
  return null;
}

/** Returns fine-grained status for a project's dev server. */
export function getDevServerStatus(projectId: string): {
  state: DevServerState;
  port: number | null;
} {
  const entry = entries.get(projectId);
  if (entry) {
    return { state: entry.state, port: entry.port };
  }

  // Check if it's currently being spawned (e.g. npm install)
  if (spawning.has(projectId)) {
    return { state: 'starting', port: null };
  }

  // Check if it's in a restart back-off timer
  if (restartTimers.has(projectId)) {
    return { state: 'starting', port: null };
  }

  return { state: 'idle', port: null };
}

export function touchDevServer(projectId: string): void {
  const entry = entries.get(projectId);
  if (entry) entry.lastUsed = Date.now();
}

export function killDevServer(projectId: string, diskPath?: string): void {
  // Cancel any pending restart first
  const timer = restartTimers.get(projectId);
  if (timer) { clearTimeout(timer); restartTimers.delete(projectId); }

  const entry = entries.get(projectId);
  const pathForCleanup = diskPath || entry?.diskPath;

  console.log(`[PREVIEW_DEV] 🛑 Killing dev server for project ${projectId}`);

  // 1. Kill known process
  if (entry && !entry.process.killed) {
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /F /T /PID ${entry.process.pid}`, { stdio: 'ignore' });
      } catch {
        entry.process.kill('SIGKILL');
      }
    } else {
      entry.process.kill('SIGKILL');
    }
    entries.delete(projectId);
    spawning.delete(projectId);
  }

  // 2. Nuclear cleanup: Kill any lingering processes related to this project folder
  if (process.platform === 'win32' && pathForCleanup) {
    try {
      const escapedPath = pathForCleanup.replace(/\\/g, '\\\\');
      const query = `wmic process where "name='node.exe' and CommandLine like '%${escapedPath}%'" get ProcessId`;
      const output = execSync(query).toString();
      const pids = output.match(/\d+/g);

      if (pids) {
        const currentPid = process.pid.toString();
        const filteredPids = pids.filter(p => p !== currentPid);

        if (filteredPids.length > 0) {
          console.log(`[PREVIEW_DEV] ☢️ Found lingering processes for project ${projectId}: ${filteredPids.join(', ')}`);
          for (const pid of filteredPids) {
            try { execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' }); } catch { }
          }
        }
      }
    } catch {
      // Ignore wmic errors
    }
  }
}

// ── Idle-timeout cleaner ─────────────────────────────────────────────────────

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of entries) {
    if (now - entry.lastUsed > IDLE_MS) {
      console.log(`[PREVIEW_DEV] ⏱ Idle timeout: killing ${entry.type.toUpperCase()} for project ${id}`);
      killDevServer(id);
    }
  }
}, 60_000).unref();

// ── Health-ping loop ─────────────────────────────────────────────────────────
// Every HEALTH_CHECK_INTERVAL_MS, TCP-probe every registered port.
// If the probe fails (process died but exit event hasn't fired yet), treat it
// as a crash and trigger the same restart logic.

setInterval(async () => {
  for (const [projectId, entry] of entries) {
    if (!entry.ready) continue; // Still starting — skip

    const alive = await tcpProbe(entry.port);
    if (!alive) {
      console.warn(
        `[PREVIEW_DEV] 💔 Health-ping failed for project ${projectId} on port ${entry.port}. ` +
        `Treating as crash — triggering restart.`
      );

      // Remove the stale entry and schedule restart
      const { diskPath, restartCount } = entry;
      if (!entry.process.killed) {
        try { entry.process.kill('SIGKILL'); } catch { }
      }
      entries.delete(projectId);
      spawning.delete(projectId);

      scheduleRestart(projectId, diskPath, restartCount);
    }
  }
}, HEALTH_CHECK_INTERVAL_MS).unref();
