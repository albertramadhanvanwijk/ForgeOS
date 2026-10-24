# API Contracts and Observability

Illustrative contracts; align with repository conventions.

- `POST /api/memory/candidates`: create candidate from event/run/artifact references; authenticate, authorize, scan, deduplicate/idempotency-check, persist.
- `POST /api/memory/retrieve`: accept task/project/role/scopes/token budget; enforce access before ranking; return bounded context with provenance and warnings.
- `PATCH /api/memory/items/{id}`: correct or transition status; create version/superseding relation; invalidate caches/indexes; audit.
- `POST /api/memory/items/{id}/validate`: run policy profile against evidence and return checks/result.
- `POST /api/memory/items/{id}/promote`: evaluate target scope, justification, evidence, and approval reference; reject unauthorized scope broadening.
- `POST /api/memory/items/{id}/feedback`: accept helpful/irrelevant/incorrect/stale/unsafe feedback.

## Metrics
Capture totals/latency; validation outcomes; retrieval latency/count; feedback totals; stale hits; conflict count; cache invalidation latency; scope denials; promotion outcomes; controlled task-outcome delta.

Never put memory content, secrets, or sensitive identifiers into metric labels. Use correlation IDs and access-controlled audit references.

## Reliability
Idempotency keys, bounded retries, dead-letter visibility, index/cache consistency, health/readiness checks, and operational dashboards.
