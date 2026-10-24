# 14 --- Antigravity Implementation Brief

Act as Principal Software Architect, Senior Full-Stack Engineer, AI
Systems Engineer, Security Engineer, and Technical Lead.

Objective: implement ForgeOS as a hybrid cloud/local AI Engineering OS
delivering verified outcomes, not a UI-only mockup.

First audit the actual repository: stack, persistence, runtime,
integrations, reusable modules, design system, placeholders, tests.
Produce gap analysis and dependency-aware plan. Preserve working
functionality; do not assume features exist from UI/docs.

Use explicit module boundaries for application/API, Orchestrator,
persistent workflow, registries, artifacts/memory, capability graph,
permissions/approvals, quality/evaluation, execution adapters,
Git/release, Platform Builder, observability. Prefer modular monolith
unless evidence supports services. Keep business state independent of
model SDK.

Select agents dynamically based on task/project needs, dependencies,
permissions, tools, quality and budget. Persist state and selection
rationale. Version artifacts and provenance; never claim verification
without evidence.

Use isolated execution, Git worktrees, real build/test, logs,
cancellation, resource limits, artifact collection. Never execute
arbitrary generated commands outside policy or expose unrestricted host
access/secrets.

Implement task-appropriate gates, bounded repair/retries, regression
tests, checkpoints, restart recovery. Required failed gates block
verified/released status.

Platform Builder must inspect graph/repository, identify reuse/gaps,
analyze cross-module impacts, create versioned PlatformChangeSet,
implement in isolation, test, show diff/preview, obtain policy
approvals, release, verify, and reconcile capability graph. Never
silently modify production or bypass policy.

Reuse design system. Create new UI only for meaningful interactions, not
one page per agent. UI reflects real backend state and handles
loading/empty/waiting/success/partial/error/timeout/denied states.

For every increment: state scope/dependencies; implement coherent slice;
run and inspect checks; review diff; record results/limitations; update
traceability; report implemented vs verified vs incomplete. Start with
repository audit and implement the highest-priority dependency-safe
phase.
