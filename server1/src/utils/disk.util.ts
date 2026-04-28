import { execSync } from 'child_process';
import * as os from 'os';

export interface DiskSpace {
    total: number;
    free: number;
    used: number;
}

export async function checkDiskSpace(directoryPath: string): Promise<DiskSpace> {
    const isWindows = os.platform() === 'win32';

    if (isWindows) {
        try {
            const drive = directoryPath.substring(0, 3); // e.g. "C:\"
            const cmd = `powershell -Command "Get-PSDrive ${drive[0]} | Select-Object Used, Free"`;
            const output = execSync(cmd, { timeout: 2000 }).toString();
            const lines = output.trim().split('\n');
            if (lines.length >= 3) {
                const values = lines[2].trim().split(/\s+/);
                const used = parseInt(values[0]);
                const free = parseInt(values[1]);
                if (!isNaN(used) && !isNaN(free)) {
                    return {
                        total: used + free,
                        free: free,
                        used: used
                    };
                }
            }
        } catch (err) {
            // Failed to check disk space
        }
        // If Windows check fails, fall through to returning dummy data
    } else {
        try {
            const output = execSync(`df -b "${directoryPath}" | tail -1`, { timeout: 2000 }).toString();
            const parts = output.trim().split(/\s+/);
            if (parts.length >= 4) {
                const total = parseInt(parts[1]);
                const used = parseInt(parts[2]);
                const free = parseInt(parts[3]);
                if (!isNaN(total) && !isNaN(used) && !isNaN(free)) {
                    return { total, used, free };
                }
            }
        } catch (err) {
            // Failed to check disk space
        }
    }

    // Fallback constants or dummy data if everything fails
    return {
        total: 100 * 1024 * 1024 * 1024,
        free: 1024 * 1024 * 1024,
        used: 99 * 1024 * 1024 * 1024
    };
}
