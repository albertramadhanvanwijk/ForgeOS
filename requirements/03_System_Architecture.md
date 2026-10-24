# 03 --- System Architecture

Layers: Human Interface (Chat/Dashboard/Projects/Design Studio/Quality
Center/Platform Builder); Application/API; Control Plane (Orchestrator,
persistent Workflow Engine, registries, policy, quality gates);
Intelligence (agents, skills, model router, context manager, evaluator);
Knowledge (artifacts, memory, capability graph, audit); Execution Plane
(sandbox/local runner/Git/build/test/preview/deployment); external
providers/services.

Start with a modular monolith and explicit module interfaces. Suggested
stack: Next.js/React/TypeScript; TypeScript backend (NestJS or Fastify);
PostgreSQL; S3-compatible/local object storage; durable workflow engine;
model provider adapters; isolated execution; Git worktrees; structured
logs/metrics/traces. Audit repository before selecting or replacing
technologies.

Responsibilities: Orchestrator plans/assigns/escalates; workflow engine
persists state; agents perform scoped work; tool adapters execute
operations; Artifact Registry stores outputs/provenance; Policy Engine
authorizes actions; Quality Engine checks evidence; Approval Engine
waits for decisions; UI reflects backend state.

Persist projects, requirements, decisions, workflow/task state,
definitions, artifacts, approvals, audit events, platform changes,
quality results, provider metadata, releases. Version domain events such
as ProjectCreated, PlanProposed, ApprovalGranted, TaskStarted/Failed,
ArtifactCreated, QualityGateFailed, PlatformChangeReleased,
DeploymentVerified.

Execution environments need ownership, resource/time limits,
network/filesystem permissions, scoped secrets, logs, cancellation, and
cleanup. Split into services only when measurable
scaling/isolation/reliability needs justify it.
