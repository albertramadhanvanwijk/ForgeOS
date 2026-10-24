import {
  StructuredLogEntry,
  StructuredLogInput,
  LogQueryFilter,
  LogLevel,
} from './types.js';

export class StructuredLogger {
  private logs: StructuredLogEntry[] = [];
  private readonly maxStoredLogs = 10000;

  public log(input: StructuredLogInput): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      ...input,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
      level: input.level || 'info',
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift();
    }

    return entry;
  }

  public debug(input: Omit<StructuredLogInput, 'level'>): StructuredLogEntry {
    return this.log({ ...input, level: 'debug' });
  }

  public info(input: Omit<StructuredLogInput, 'level'>): StructuredLogEntry {
    return this.log({ ...input, level: 'info' });
  }

  public warn(input: Omit<StructuredLogInput, 'level'>): StructuredLogEntry {
    return this.log({ ...input, level: 'warn' });
  }

  public error(input: Omit<StructuredLogInput, 'level'>): StructuredLogEntry {
    return this.log({ ...input, level: 'error' });
  }

  public fatal(input: Omit<StructuredLogInput, 'level'>): StructuredLogEntry {
    return this.log({ ...input, level: 'fatal' });
  }

  public query(filter: LogQueryFilter = {}): StructuredLogEntry[] {
    let result = this.logs;

    if (filter.projectId) {
      result = result.filter((l) => l.projectId === filter.projectId);
    }
    if (filter.runId) {
      result = result.filter((l) => l.runId === filter.runId);
    }
    if (filter.taskId) {
      result = result.filter((l) => l.taskId === filter.taskId);
    }
    if (filter.component) {
      result = result.filter((l) => l.component === filter.component);
    }
    if (filter.level) {
      result = result.filter((l) => l.level === filter.level);
    }

    if (filter.limit && filter.limit > 0) {
      result = result.slice(-filter.limit);
    }

    return result;
  }
}
