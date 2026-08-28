export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

function resolveLogLevel(): LogLevel {
  switch ((process.env.LOG_LEVEL ?? 'INFO').trim().toUpperCase()) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
}

export class Logger {
  private readonly minLevel: LogLevel = resolveLogLevel();

  constructor(private readonly scope: string) {}

  debug(message: string, ...args: unknown[]): void {
    this.write(LogLevel.DEBUG, message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.write(LogLevel.INFO, message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.write(LogLevel.WARN, message, args);
  }

  error(message: string, ...args: unknown[]): void {
    this.write(LogLevel.ERROR, message, args);
  }

  private write(level: LogLevel, message: string, args: unknown[]): void {
    if (level < this.minLevel) return;
    const line = `[${new Date().toISOString()}] [${LEVEL_LABELS[level]}] [${this.scope}] ${message}`;
    if (args.length > 0) {
      console.log(line, ...args);
    } else {
      console.log(line);
    }
  }
}

export function createLogger(scope: string): Logger {
  return new Logger(scope);
}
