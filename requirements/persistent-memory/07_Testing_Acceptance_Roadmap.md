# Testing, Acceptance Criteria, and Roadmap

## Acceptance scenarios
- **Capture/provenance:** completed task with verified test report produces a candidate linked to the run and report, with accurate verification status.
- **Isolation:** Project A-only caller never receives Project B memory even when similarity is high.
- **Secret rejection:** candidate with token is not persisted in ordinary memory/indexes.
- **Conflict:** contradictory sources are surfaced or resolved via authoritative current source with warning, never silently merged.
- **Staleness:** memory for old framework version is flagged/deprioritized when project uses a newer version.
- **Correction:** incorrect item is excluded/labeled and caches/indexes invalidated.
- **Promotion:** confidential project lesson cannot be promoted as-is to shared scope.
- **Explainability:** each retrieved item has ID/version, source/status, and retrieval reason.
- **Outage:** workflow follows risk policy and does not falsely claim required steps complete.
- **Prompt injection:** memory recommending policy bypass does not override policy or action authorization.
- **Idempotency:** repeated event delivery does not create duplicate active memory.
- **Deletion:** accepted deletion removes item from active retrieval, derived indexes, and caches within documented SLO, subject to disclosed backup/legal constraints.

## Definition of Done
- Requirements traced to code and tests.
- API/data-layer project isolation tests pass.
- Provenance/version history visible.
- Candidate capture is idempotent and observable.
- Retrieval is bounded, permission-filtered, source-linked.
- Conflict, stale, secret, injection, deletion, and outage cases tested.
- Memory Center lifecycle/review actions work.
- Metrics and operational failure behavior documented.
- No unsupported claims of verification or completion.

## Roadmap
0. **Audit:** inspect existing DB, auth, workflow events, artifact registry, search, agent context, UI, tests, telemetry. Document existing capabilities/gaps.
1. **Foundation:** schema, permission checks, provenance, versioning, lifecycle, audit, full-text search.
2. **Capture:** durable/idempotent event ingestion, candidate extraction, secret screening, validation, retries.
3. **Retrieval:** Orchestrator integration, role/project filters, bounded package, telemetry.
4. **UI:** Explorer, detail/version history, Activity, Review Queue.
5. **Maintenance/evaluation:** feedback, freshness, dedupe, conflict handling, cache invalidation, controlled outcome evaluation.
6. **Optional semantic search:** add vector index only if evaluation proves a measurable benefit.
