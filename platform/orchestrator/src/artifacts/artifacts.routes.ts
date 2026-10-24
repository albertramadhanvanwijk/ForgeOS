import type { FastifyPluginAsync } from 'fastify';
import {
  ArtifactRegistry,
  InMemoryArtifactStorage,
  CreateArtifactInput,
  CreateVersionInput,
} from '@forgeos/artifact-registry';
import type { ArtifactStatus } from '@forgeos/types';

export interface ArtifactsPluginOptions {
  registry?: ArtifactRegistry;
}

export const artifactsRoutes: FastifyPluginAsync<ArtifactsPluginOptions> = async (app, opts) => {
  const registry = opts.registry ?? new ArtifactRegistry(new InMemoryArtifactStorage());

  // POST /api/artifacts - Create artifact with initial version
  app.post<{
    Body: CreateArtifactInput;
  }>('/', async (request, reply) => {
    const { projectId, type, title, content } = request.body || {};

    if (!projectId || !type || !title || content === undefined) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Properties "projectId", "type", "title", and "content" are required',
      });
    }

    const artifact = await registry.createArtifact(request.body);
    const version = await registry.getLatestVersion(artifact.id);

    return reply.status(201).send({
      ...artifact,
      latestVersion: version,
    });
  });

  // POST /api/artifacts/:id/versions - Publish new version
  app.post<{
    Params: {
      id: string;
    };
    Body: CreateVersionInput;
  }>('/:id/versions', async (request, reply) => {
    const { id } = request.params;
    const { content } = request.body || {};

    if (content === undefined) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "content" is required for publishing a version',
      });
    }

    try {
      const version = await registry.createVersion(id, request.body);
      const artifact = await registry.getArtifact(id);
      return reply.status(201).send({
        artifact,
        version,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(404).send({ error: 'Not Found', message });
    }
  });

  // GET /api/artifacts - List artifacts
  app.get<{
    Querystring: {
      projectId?: string;
      type?: string;
      status?: ArtifactStatus;
    };
  }>('/', async (request, reply) => {
    const list = await registry.listArtifacts(request.query);
    return reply.status(200).send(list);
  });

  // GET /api/artifacts/:id - Get artifact details
  app.get<{
    Params: {
      id: string;
    };
  }>('/:id', async (request, reply) => {
    const { id } = request.params;
    const artifact = await registry.getArtifact(id);

    if (!artifact) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Artifact with ID "${id}" was not found`,
      });
    }

    const latestVersion = await registry.getLatestVersion(id);
    const content = await registry.getContent(id);

    return reply.status(200).send({
      ...artifact,
      latestVersion,
      content,
    });
  });

  // GET /api/artifacts/:id/versions/:version - Get specific version & content
  app.get<{
    Params: {
      id: string;
      version: string;
    };
  }>('/:id/versions/:version', async (request, reply) => {
    const { id, version: versionStr } = request.params;
    const versionNumber = parseInt(versionStr, 10);

    if (isNaN(versionNumber)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Version must be a valid integer',
      });
    }

    const version = await registry.getVersion(id, versionNumber);
    if (!version) {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Version ${versionNumber} of artifact "${id}" was not found`,
      });
    }

    const content = await registry.getContent(id, versionNumber);

    return reply.status(200).send({
      version,
      content,
    });
  });

  // PATCH /api/artifacts/:id/status - Update artifact status
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      status?: ArtifactStatus;
    };
  }>('/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body || {};

    if (!status) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Property "status" is required',
      });
    }

    try {
      const updated = await registry.updateStatus(id, status);
      return reply.status(200).send(updated);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(404).send({ error: 'Not Found', message });
    }
  });
};
