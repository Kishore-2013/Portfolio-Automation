type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service?: string;
  data?: unknown;
}

function log(level: LogLevel, message: string, data?: unknown, service?: string): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service,
    data,
  };

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for log aggregation (e.g., Grafana Loki)
    console.log(JSON.stringify(entry));
  } else {
    // Human-readable for local development
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${service ? ` [${service}]` : ''}`;
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

export const logger = {
  debug: (msg: string, data?: unknown, svc?: string) => log('debug', msg, data, svc),
  info:  (msg: string, data?: unknown, svc?: string) => log('info',  msg, data, svc),
  warn:  (msg: string, data?: unknown, svc?: string) => log('warn',  msg, data, svc),
  error: (msg: string, data?: unknown, svc?: string) => log('error', msg, data, svc),
};
