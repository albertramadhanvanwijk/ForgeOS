import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ConversationService } from './conversation.service.js';
import { IntentClassifier } from './intent-classifier.js';

export interface IntentRoutesOptions {
  conversationService: ConversationService;
  intentClassifier?: IntentClassifier;
}

export const registerIntentRoutes = (app: FastifyInstance, options: IntentRoutesOptions) => {
  const { conversationService, intentClassifier = new IntentClassifier() } = options;

  // Direct intent classification endpoint
  app.post('/api/intent/classify', async (request, reply) => {
    const body = request.body as { prompt: string; contextHistory?: Array<{ role: string; content: string }> };
    if (!body || !body.prompt) {
      return reply.status(400).send({ error: 'Missing required field: prompt' });
    }

    const analysis = intentClassifier.classify({
      prompt: body.prompt,
      contextHistory: body.contextHistory,
    });

    return reply.status(200).send(analysis);
  });

  // Create conversation under project
  app.post('/api/projects/:projectId/conversations', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = (request.body as { title?: string; type?: 'orchestrator' | 'agent' | 'platform_builder' | 'review' }) || {};

    const conversation = conversationService.createConversation(
      projectId,
      body.title || 'Orchestrator Conversation',
      body.type || 'orchestrator'
    );

    return reply.status(201).send(conversation);
  });

  // List conversations under project
  app.get('/api/projects/:projectId/conversations', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const conversations = conversationService.listConversations(projectId);
    return reply.status(200).send(conversations);
  });

  // Get messages in a conversation
  app.get('/api/conversations/:id/messages', async (request, reply) => {
    const { id } = request.params as { id: string };
    const conversation = conversationService.getConversation(id);
    if (!conversation) {
      return reply.status(404).send({ error: `Conversation ${id} not found` });
    }

    const messages = conversationService.getMessages(id);
    return reply.status(200).send(messages);
  });

  // Post message to conversation (processes user intent, context, and replies)
  app.post('/api/conversations/:id/messages', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { prompt: string };
    if (!body || !body.prompt) {
      return reply.status(400).send({ error: 'Missing required field: prompt' });
    }

    try {
      const result = await conversationService.processUserMessage(id, body.prompt);
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(404).send({ error: err.message });
    }
  });
};
