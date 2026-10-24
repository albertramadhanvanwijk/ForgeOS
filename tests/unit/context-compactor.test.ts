import { describe, it, expect } from 'vitest';
import {
  ContextCompactor,
  ConversationMessage,
} from '../../platform/observability/src/context-compactor.js';

describe('Task 5.4: Context Compactor & Budget Enforcement (FR-092)', () => {
  const compactor = new ContextCompactor({
    maxMessagesBeforeCompaction: 6,
    retainRecentMessages: 2,
  });

  const sampleMessages: ConversationMessage[] = [
    { role: 'user', content: 'Create a website for our coffee shop', timestamp: 1000 },
    { role: 'agent', agentRole: 'architect', content: 'I have created the PRD and requirements.', timestamp: 2000 },
    { role: 'agent', agentRole: 'designer', content: 'Design system spec generated with dark warm coffee theme.', timestamp: 3000 },
    { role: 'agent', agentRole: 'engineer', content: 'Scaffolded Hero, Menu, and Contact components.', timestamp: 4000 },
    { role: 'agent', agentRole: 'qa', content: 'Ran 12 unit tests, all passed.', timestamp: 5000 },
    { role: 'user', content: 'Can we add a reservation modal?', timestamp: 6000 },
    { role: 'agent', agentRole: 'engineer', content: 'Added ReservationModal.tsx component.', timestamp: 7000 },
  ];

  it('determines when compaction is needed based on message count threshold', () => {
    expect(compactor.needsCompaction(sampleMessages.slice(0, 4))).toBe(false);
    expect(compactor.needsCompaction(sampleMessages)).toBe(true);
  });

  it('compacts early conversation history into structured architectural summary while keeping recent turns', () => {
    const compacted = compactor.compact(sampleMessages);

    expect(compacted.wasCompacted).toBe(true);
    expect(compacted.retainedRecentCount).toBe(2);
    // Recent 2 messages must be preserved intact
    expect(compacted.messages[compacted.messages.length - 1].content).toBe('Added ReservationModal.tsx component.');
    expect(compacted.messages[compacted.messages.length - 2].content).toBe('Can we add a reservation modal?');

    // First message must be the synthesized summary message
    const summaryMessage = compacted.messages[0];
    expect(summaryMessage.role).toBe('system');
    expect(summaryMessage.content).toContain('[CONTEXT SUMMARY]');
    expect(summaryMessage.content).toContain('architect');
    expect(summaryMessage.content).toContain('designer');
  });

  it('preserves essential architectural decision records (ADRs) during compaction', () => {
    const messagesWithADR: ConversationMessage[] = [
      ...sampleMessages,
      { role: 'agent', content: 'DECISION: Use Tailwind CSS 3.4 for all responsive styling.', timestamp: 8000 },
      { role: 'user', content: 'Sounds good', timestamp: 9000 },
      { role: 'user', content: 'What next?', timestamp: 10000 },
    ];

    const compacted = compactor.compact(messagesWithADR);
    const summaryMessage = compacted.messages[0];
    expect(summaryMessage.content).toContain('Tailwind CSS 3.4');
  });
});
