import type { FastifyPluginAsync } from 'fastify';
import { AgentRegistry, TaskRequirement } from '@forgeos/agent-registry';
import * as path from 'node:path';

export interface RegistryPluginOptions {
  registry?: AgentRegistry;
}

export const registryRoutes: FastifyPluginAsync<RegistryPluginOptions> = async (app, opts) => {
  let registry = opts.registry;

  if (!registry) {
    registry = new AgentRegistry();
    const rolesPath = path.resolve(process.cwd(), 'agents/roles');
    await registry.loadFromDirectory(rolesPath);
  }

  // GET /api/registry/roles
  app.get('/roles', async () => {
    return registry!.listRoles();
  });

  // GET /api/registry/skills
  app.get('/skills', async () => {
    return registry!.listSkills();
  });

  // GET /api/registry/tools
  app.get('/tools', async () => {
    return registry!.listTools();
  });

  // POST /api/registry/select - Select agents by task (FR-021, FR-024, FR-027)
  app.post<{
    Body: {
      taskId?: string;
      name?: string;
      requiredCapabilities?: string[];
      requiredSkills?: string[];
    };
  }>('/select', async (request, reply) => {
    const { taskId, name, requiredCapabilities, requiredSkills } = request.body || {};

    if (!taskId || !requiredCapabilities || !Array.isArray(requiredCapabilities)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Properties "taskId" and array "requiredCapabilities" are required',
      });
    }

    const task: TaskRequirement = {
      id: taskId,
      name: name ?? taskId,
      requiredCapabilities,
      requiredSkills,
    };

    const decision = registry!.selectAgentsForTask(task);
    return reply.status(200).send(decision);
  });
};
