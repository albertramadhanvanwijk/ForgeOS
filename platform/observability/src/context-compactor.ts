export interface ConversationMessage {
  role: 'user' | 'agent' | 'system';
  agentRole?: string;
  content: string;
  timestamp: number;
}

export interface CompactorOptions {
  maxMessagesBeforeCompaction?: number;
  retainRecentMessages?: number;
}

export interface CompactedResult {
  wasCompacted: boolean;
  messages: ConversationMessage[];
  retainedRecentCount: number;
  compactedCount: number;
}

export class ContextCompactor {
  private maxMessages: number;
  private retainRecent: number;

  constructor(options: CompactorOptions = {}) {
    this.maxMessages = options.maxMessagesBeforeCompaction ?? 12;
    this.retainRecent = options.retainRecentMessages ?? 3;
  }

  public needsCompaction(messages: ConversationMessage[]): boolean {
    return messages.length > this.maxMessages;
  }

  public compact(messages: ConversationMessage[]): CompactedResult {
    if (!this.needsCompaction(messages)) {
      return {
        wasCompacted: false,
        messages: [...messages],
        retainedRecentCount: messages.length,
        compactedCount: 0,
      };
    }

    const cutIndex = Math.max(0, messages.length - this.retainRecent);
    const olderMessages = messages.slice(0, cutIndex);
    const recentMessages = messages.slice(cutIndex);

    // Extract key entities, agent accomplishments, and ADRs from olderMessages
    const involvedAgents = new Set<string>();
    const decisions: string[] = [];
    const keyActions: string[] = [];

    for (const msg of olderMessages) {
      if (msg.agentRole) involvedAgents.add(msg.agentRole);

      // Check for decision markers or ADRs
      if (msg.content.includes('DECISION:') || msg.content.includes('ADR:')) {
        decisions.push(msg.content.trim());
      } else if (msg.role === 'user') {
        keyActions.push(`User request: "${msg.content.slice(0, 100)}"`);
      } else if (msg.agentRole) {
        keyActions.push(`${msg.agentRole}: ${msg.content.slice(0, 120)}`);
      }
    }

    const summaryParts = [
      `[CONTEXT SUMMARY] Compacted ${olderMessages.length} prior conversation turns.`,
      `Involved Agents: ${Array.from(involvedAgents).join(', ') || 'orchestrator'}.`,
    ];

    if (decisions.length > 0) {
      summaryParts.push(`Key Decisions & ADRs:\n${decisions.map((d) => `- ${d}`).join('\n')}`);
    }

    if (keyActions.length > 0) {
      summaryParts.push(
        `Milestones:\n${keyActions.slice(-4).map((a) => `- ${a}`).join('\n')}`
      );
    }

    const synthesizedSummaryMessage: ConversationMessage = {
      role: 'system',
      content: summaryParts.join('\n\n'),
      timestamp: Date.now(),
    };

    return {
      wasCompacted: true,
      messages: [synthesizedSummaryMessage, ...recentMessages],
      retainedRecentCount: recentMessages.length,
      compactedCount: olderMessages.length,
    };
  }
}
