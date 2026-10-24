import type { AuditEvent } from '@forgeos/types';
import { randomUUID } from 'node:crypto';

export interface IAuditLogger {
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
  getLogs(filter?: { correlationId?: string; actor?: string }): AuditEvent[];
}

export class InMemoryAuditLogger implements IAuditLogger {
  private logs: AuditEvent[] = [];

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const record: AuditEvent = {
      id: randomUUID(),
      timestamp: new Date(),
      ...event,
    };
    this.logs.push(record);
    return record;
  }

  getLogs(filter?: { correlationId?: string; actor?: string }): AuditEvent[] {
    let result = [...this.logs];
    if (filter?.correlationId) {
      result = result.filter((l) => l.correlationId === filter.correlationId);
    }
    if (filter?.actor) {
      result = result.filter((l) => l.actor === filter.actor);
    }
    return result;
  }
}
