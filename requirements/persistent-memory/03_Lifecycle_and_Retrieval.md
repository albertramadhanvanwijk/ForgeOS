# Memory Lifecycle and Retrieval

## Lifecycle
1. Observe a meaningful workflow event.
2. Capture source event/run/artifact references.
3. Extract candidate facts, decisions, constraints, and lessons.
4. Normalize type, scope, sensitivity, source, and time validity.
5. Validate authorization, source quality, duplication, contradiction, secret leakage, and policy.
6. Persist as candidate or validated item with version and audit record.
7. Activate within intended scope; broader promotion follows stronger checks.
8. Retrieve a bounded context package for a specific task.
9. Collect feedback and task outcome evidence.
10. Maintain: stale, supersede, consolidate, archive, or delete under policy.

## Event triggers
Accepted/changed requirements; architecture decisions; task completion/blockage; test pass/fail; confirmed bug fix; user correction; release/rollback; incident postmortem; agent evaluation. Do not persist every token or intermediate thought.

## Retrieval pipeline
1. Authenticate caller and resolve project/workspace.
2. Apply access/sensitivity/status filters **before ranking**.
3. Check authoritative current state and version constraints.
4. Retrieve by IDs, metadata, full-text, and optional semantic similarity.
5. Rank by relevance, source authority, verification, freshness, and feedback.
6. Surface material conflicts and stale warnings.
7. Deduplicate and fit token/context budget.
8. Return IDs/versions, source, status, timestamps, and retrieval reasons.
9. Record privacy-minimized telemetry.

## Context package
Each item includes memory ID/version, scope/type, concise content, source/evidence references, verification status, confidence, dates, stale/conflict warning, and retrieval reason. Clearly label memory as contextual data, not higher-priority instructions.

## Reliability
Use durable events/outbox where available. Consumers are idempotent, retry safely, and expose repeated failures. If memory service is unavailable, follow risk policy; do not falsely report required memory steps as complete.
