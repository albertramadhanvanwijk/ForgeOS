import { FastifyInstance } from 'fastify';
import { GitService } from './git.service.js';

export interface GitRoutesOptions {
  gitService: GitService;
}

export const registerGitRoutes = (app: FastifyInstance, options: GitRoutesOptions) => {
  const { gitService } = options;

  app.get('/api/git/status', async (_request, reply) => {
    try {
      const status = await gitService.getStatus();
      return reply.status(200).send(status);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.post('/api/git/branch', async (request, reply) => {
    const body = request.body as { branchName: string; baseBranch?: string };
    if (!body || !body.branchName) {
      return reply.status(400).send({ error: 'Missing required field: branchName' });
    }

    try {
      await gitService.createBranch(body.branchName, body.baseBranch);
      return reply.status(201).send({ message: `Branch ${body.branchName} created` });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.post('/api/git/worktree', async (request, reply) => {
    const body = request.body as { worktreePath: string; branchName: string };
    if (!body || !body.worktreePath || !body.branchName) {
      return reply.status(400).send({ error: 'Missing required fields: worktreePath, branchName' });
    }

    try {
      const worktree = await gitService.createWorktree(body.worktreePath, body.branchName);
      return reply.status(201).send(worktree);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.delete('/api/git/worktree', async (request, reply) => {
    const body = request.body as { worktreePath: string };
    if (!body || !body.worktreePath) {
      return reply.status(400).send({ error: 'Missing required field: worktreePath' });
    }

    try {
      await gitService.removeWorktree(body.worktreePath);
      return reply.status(200).send({ message: `Worktree ${body.worktreePath} removed` });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.get('/api/git/diff', async (request, reply) => {
    const query = (request.query as { baseRef?: string }) || {};
    try {
      const diff = await gitService.getDiffSummary(query.baseRef);
      return reply.status(200).send(diff);
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });

  app.post('/api/git/commit', async (request, reply) => {
    const body = request.body as { message: string; files?: string[] };
    if (!body || !body.message) {
      return reply.status(400).send({ error: 'Missing required field: message' });
    }

    try {
      const commitOutput = await gitService.commit(body.message, body.files);
      return reply.status(201).send({ commitOutput });
    } catch (err: any) {
      return reply.status(500).send({ error: err.message });
    }
  });
};
