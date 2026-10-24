import { IntentClassifier } from './intent-classifier.js';
import { AdaptivePlanner } from './adaptive-planner.js';
import { IntentAnalysis, AdaptivePlan } from './types.js';

export interface ConversationRecord {
  id: string;
  projectId: string;
  title: string;
  type: 'orchestrator' | 'agent' | 'platform_builder' | 'review';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ProcessMessageResult {
  reply: string;
  analysis: IntentAnalysis;
  adaptivePlan?: AdaptivePlan;
  requiresClarification: boolean;
}

export class ConversationService {
  private conversations = new Map<string, ConversationRecord>();
  private messages = new Map<string, MessageRecord[]>();

  constructor(
    private readonly classifier = new IntentClassifier(),
    private readonly planner = new AdaptivePlanner()
  ) {}

  public createConversation(projectId: string, title = 'New Conversation', type: 'orchestrator' | 'agent' | 'platform_builder' | 'review' = 'orchestrator'): ConversationRecord {
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const conversation: ConversationRecord = {
      id,
      projectId,
      title,
      type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    this.messages.set(id, []);
    return conversation;
  }

  public getConversation(id: string): ConversationRecord | undefined {
    return this.conversations.get(id);
  }

  public listConversations(projectId: string): ConversationRecord[] {
    return Array.from(this.conversations.values()).filter((c) => c.projectId === projectId);
  }

  public getMessages(conversationId: string): MessageRecord[] {
    return this.messages.get(conversationId) || [];
  }

  public async processUserMessage(conversationId: string, prompt: string): Promise<ProcessMessageResult> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const history = this.messages.get(conversationId) || [];

    // Store user message
    const userMsg: MessageRecord = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      role: 'user',
      content: prompt,
      createdAt: new Date(),
    };
    history.push(userMsg);

    // Classify intent using prompt and previous conversation turns
    const analysis = this.classifier.classify({
      prompt,
      contextHistory: history.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
    });

    let reply = '';
    let adaptivePlan: AdaptivePlan | undefined;

    if (analysis.isAmbiguous) {
      reply = `I need clarification before generating an execution plan:\n${analysis.clarifyingQuestions.map((q) => `• ${q}`).join('\n')}`;
    } else {
      adaptivePlan = this.planner.generateWorkflowDAG({
        projectId: conversation.projectId,
        analysis,
      });

      reply = `Classified intent as **${analysis.intentType.toUpperCase()}** (Confidence: ${(analysis.confidence * 100).toFixed(0)}%).\n` +
        `Suggested workflow: **${analysis.suggestedWorkflow}** with ${adaptivePlan.tasks.length} ordered tasks.\n` +
        `Roles involved: ${analysis.suggestedRoles.join(', ')}.`;
    }

    // Store assistant reply
    const assistantMsg: MessageRecord = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      role: 'assistant',
      content: reply,
      metadata: { analysis, planId: adaptivePlan?.id },
      createdAt: new Date(),
    };
    history.push(assistantMsg);

    conversation.updatedAt = new Date();

    return {
      reply,
      analysis,
      adaptivePlan,
      requiresClarification: analysis.isAmbiguous,
    };
  }
}
