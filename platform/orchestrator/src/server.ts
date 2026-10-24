import { createServer } from './app.js';

async function main() {
  const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 3001;
  const host = '0.0.0.0';

  const app = await createServer({ logger: true });

  try {
    await app.listen({ port, host });
    console.log(`[ForgeOS Orchestrator] Server listening on http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}
