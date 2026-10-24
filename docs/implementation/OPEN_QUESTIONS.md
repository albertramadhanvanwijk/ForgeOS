# ForgeOS — Open Questions

**Date:** 2026-10-24

> Track architectural decisions that are undecided or need confirmation before implementation can proceed. Close questions by recording the decision and date.

---

## Open (Need Decision)

| # | Question | Impact | Decision Required By |
|---|----------|--------|---------------------|
| OQ-001 | Backend framework: **NestJS** vs **Fastify**? NestJS gives strong module DI system that mirrors ForgeOS module structure; Fastify is lighter and faster. | Module layout, middleware, DI patterns | Phase 1 start |
| OQ-002 | Workflow engine: **Custom durable queue on PostgreSQL** vs **Temporal**? Custom is simpler to start; Temporal is production-grade but adds operational complexity. | Infrastructure, deployment, complexity | Phase 1 start |
| OQ-003 | First LLM provider: OpenAI, Anthropic, or Gemini? Which to implement first in the model gateway adapter? | Model gateway, `.env.example`, testing | Phase 2 start |
| OQ-004 | Local runner: Does the project owner need local-machine code execution (Docker-sandboxed) for MVP, or is a no-op/stub adapter sufficient initially? | Infrastructure complexity, security surface | Phase 2 start |
| OQ-005 | Auth strategy: Self-managed JWT + RBAC vs external provider (Auth0, Clerk, Supabase Auth)? Self-managed gives more control; external saves time. | packages/auth, DB schema, session management | Phase 1 start |
| OQ-006 | Object storage: **MinIO** (local Docker) vs **S3** (AWS) vs **filesystem** for MVP? | Infrastructure, Artifact Registry, .env | Phase 1 start |
| OQ-007 | Cost/concurrency budget targets: What are the max concurrent workflow runs, model calls per minute, and monthly cost ceiling for MVP? | Policy Engine, rate limiting, billing | Phase 2 |
| OQ-008 | RPO/RTO targets: What are acceptable recovery point and recovery time objectives for the MVP deployment? | Backup config, DR procedures | Phase 1 end |
| OQ-009 | Deployment target for MVP: Local Docker Compose only, or also a cloud provider (Railway, Fly.io, AWS)? | Infrastructure, CI/CD, .env | Phase 6 |
| OQ-010 | First Platform Builder scope: What is the smallest useful PlatformChangeSet that should work at initial release? | Platform Builder Phase 4 scope | Phase 4 start |

---

## Closed (Decided)

| # | Question | Decision | Date | Source |
|---|----------|----------|------|--------|
| OQ-C001 | Monolith vs microservices? | **Modular monolith first** (ADR-003). Split only for measured need. | — | ADR-003 |
| OQ-C002 | Database? | **PostgreSQL** — relational, JSONB, full-text, proven (ADR assumption) | — | `03_System_Architecture.md` |
| OQ-C003 | Frontend framework? | **Next.js + React + TypeScript** | — | `03_System_Architecture.md` |
| OQ-C004 | ORM? | **Prisma** — TypeScript-native, migrations, type safety | 2026-10-24 | `TARGET_ARCHITECTURE.md` |
| OQ-C005 | Package manager? | **pnpm workspaces** — monorepo, efficient | 2026-10-24 | `TARGET_ARCHITECTURE.md` |
| OQ-C006 | Testing framework? | **Vitest** (unit/integration) + **Playwright** (e2e) | 2026-10-24 | `TARGET_ARCHITECTURE.md` |
| OQ-C007 | Vector/semantic search for memory? | **Not until evaluation proves benefit** (MEM requirement). Start with PostgreSQL full-text. | — | `persistent-memory/README.md` |
| OQ-C008 | Memory as source of truth? | **No** — memory is contextual, not canonical. Code→Git, runs→Workflow, policy→PolicyEngine. | — | `persistent-memory/00_Memory_System_Overview.md` |
