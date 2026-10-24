import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

export interface ServerOptions {
  logger?: boolean;
}

export async function createServer(opts: ServerOptions = { logger: false }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Health check endpoint
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'forgeos-orchestrator',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });

  return app;
}
