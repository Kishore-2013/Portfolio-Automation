/**
 * PreviewDevManager
 * -----------------
 * Manages per-project Vite dev server processes so that:
 *   GET /preview/:projectId  →  proxy to vite dev server running for that project
 *
 * Key rules:
 *  - One Vite process per project (no duplicates).
 *  - Ports are allocated from a free range at startup.
 *  - Idle servers (no requests for IDLE_MS) are cleaned up.
 *  - npm install is awaited asynchronously (non-blocking to Node event loop).
 */

import { ChildProcess, spawn } from 'child_process';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
import { injectPortfolioData } from './portfolio-data-injector';

const IDLE_MS          = 10 * 60 * 1000; // 10 minutes idle → kill dev server
const READY_TIMEOUT_MS = 60_000;          // max wait for vite to become ready
const INSTALL_TIMEOUT  = 180_000;         // max wait for npm install (3 min)
const PORT_START       = 5100;
const PORT_END         = 5200;

interface DevEntry {
  process:      ChildProcess;
  port:         number;
  projectId:    string;
  diskPath:     string;
  lastUsed:     number;
  ready:        boolean;
  readyPromise: Promise<void>;
}

// projectId → running entry
const entries = new Map<string, DevEntry>();

// projectId → in-progress spawn promise (deduplicate concurrent requests)
const spawning = new Map<string, Promise<number>>();

// ── Port helpers ───────────────────────────────────────────────────────────────

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

// ── Async npm install ──────────────────────────────────────────────────────────

function runNpmInstall(diskPath: string, projectId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`[PREVIEW_DEV] 📦 Running npm install for project ${projectId}...`);

    const isWin = process.platform === 'win32';

    const proc = spawn(
      isWin ? 'npm.cmd' : 'npm',
      ['install', '--legacy-peer-deps', '--prefer-offline'],
      {
        cwd:   diskPath,
        shell: isWin,          // .cmd files on Windows require shell:true
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

// ── Wait for Vite port to open ─────────────────────────────────────────────────

function waitForPort(port: number, timeoutMs = READY_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const attempt = () => {
      const sock = net.createConnection({ port, host: '127.0.0.1' });
      sock.once('connect', () => { sock.destroy(); resolve(); });
      sock.once('error', () => {
        sock.destroy();
        if (Date.now() >= deadline) {
          reject(new Error(`Vite dev server on port ${port} did not become ready within ${timeoutMs / 1000}s`));
        } else {
          setTimeout(attempt, 400);
        }
      });
    };
    attempt();
  });
}

// ── Spawn Vite dev server ──────────────────────────────────────────────────────

async function spawnViteDevServer(projectId: string, diskPath: string): Promise<number> {
  const isWin = process.platform === 'win32';

  // 1. Ensure the project folder exists
  if (!fs.existsSync(diskPath)) {
    throw new Error(`Portfolio source folder not found: ${diskPath}`);
  }

  // 2. Auto-install node_modules if missing
  const nmPath = path.join(diskPath, 'node_modules');
  if (!fs.existsSync(nmPath)) {
    await runNpmInstall(diskPath, projectId);
  }

  // 3. Inject portfolio data into public/portfolioData.json (non-fatal if fails)
  try {
    await injectPortfolioData(projectId, diskPath);
  } catch (err: any) {
    console.warn(`[PREVIEW_DEV] Could not inject portfolio data for ${projectId}:`, err.message);
  }

  // 4. Verify vite binary exists
  const viteBinBase = path.join(diskPath, 'node_modules', '.bin', 'vite');
  const viteBin     = isWin ? viteBinBase + '.cmd' : viteBinBase;
  if (!fs.existsSync(viteBin)) {
    throw new Error(`vite binary not found at ${viteBin}. Re-run npm install.`);
  }

  // 4. Allocate a free port
  const port = await allocatePort();
  console.log(`[PREVIEW_DEV] 🚀 Spawning Vite for project ${projectId} on port ${port}`);

  // 5. Spawn vite
  const proc = spawn(
    viteBin,
    ['--port', String(port), '--host', '127.0.0.1', '--strictPort', '--logLevel', 'warn'],
    {
      cwd:   diskPath,
      shell: isWin,
      stdio: ['ignore', 'pipe', 'pipe'],
      env:   { ...process.env, BROWSER: 'none', PORT: String(port) },
    }
  );

  proc.stdout?.on('data', (d: Buffer) =>
    console.log(`[PREVIEW_DEV:${projectId}] ${d.toString().trimEnd()}`));
  proc.stderr?.on('data', (d: Buffer) =>
    console.error(`[PREVIEW_DEV:${projectId}] ${d.toString().trimEnd()}`));

  // 6. Wait until port is open
  const readyPromise = waitForPort(port).then(() => {
    const entry = entries.get(projectId);
    if (entry) entry.ready = true;
    console.log(`[PREVIEW_DEV] ✅ Vite ready: project ${projectId} → port ${port}`);
  });

  const entry: DevEntry = {
    process:      proc,
    port,
    projectId,
    diskPath,
    lastUsed:     Date.now(),
    ready:        false,
    readyPromise,
  };
  entries.set(projectId, entry);

  proc.once('exit', (code) => {
    console.warn(`[PREVIEW_DEV] Vite exited for project ${projectId} (code ${code})`);
    entries.delete(projectId);
    spawning.delete(projectId); // allow re-spawn on next request
  });

  await readyPromise;
  return port;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns the port of an already-running (or freshly started) Vite dev server
 * for the given project. Deduplicates concurrent calls while the server is starting.
 */
export async function getOrSpawnDevServer(projectId: string, diskPath: string): Promise<number> {
  // Already running → just touch and return
  const existing = entries.get(projectId);
  if (existing && !existing.process.killed) {
    existing.lastUsed = Date.now();
    await existing.readyPromise;
    return existing.port;
  }

  // In-progress spawn → wait for it instead of creating a duplicate
  const inProgress = spawning.get(projectId);
  if (inProgress) return inProgress;

  // Start spawning
  const promise = spawnViteDevServer(projectId, diskPath).finally(() => {
    spawning.delete(projectId);
  });

  spawning.set(projectId, promise);
  return promise;
}

/**
 * Returns the port of an already-running Vite dev server, or null if none.
 * Synchronous — does NOT spawn or wait.
 */
export function getRunningPort(projectId: string): number | null {
  const entry = entries.get(projectId);
  if (entry && !entry.process.killed && entry.ready) return entry.port;
  return null;
}

/** Update last-used timestamp so the idle cleanup keeps the server alive */
export function touchDevServer(projectId: string): void {
  const entry = entries.get(projectId);
  if (entry) entry.lastUsed = Date.now();
}

/** Kill a specific project's dev server process */
export function killDevServer(projectId: string): void {
  const entry = entries.get(projectId);
  if (entry && !entry.process.killed) {
    entry.process.kill();
    entries.delete(projectId);
    spawning.delete(projectId);
    console.log(`[PREVIEW_DEV] Killed Vite dev server for project ${projectId}`);
  }
}

// ── Idle cleanup (runs every 60 s) ────────────────────────────────────────────

setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of entries) {
    if (now - entry.lastUsed > IDLE_MS) {
      console.log(`[PREVIEW_DEV] ⏱ Idle timeout: killing Vite for project ${id}`);
      killDevServer(id);
    }
  }
}, 60_000).unref(); // unref so this timer doesn't keep Node alive when shutting down
