# Data Model and Storage

Logical entities; adapt names and types to the existing codebase.

## MemoryItem
`id`, `workspace_id`, `scope_type`, `scope_id`, `memory_type`, `title`, `content`, optional generated `summary`, `status`, `confidence`, `verification_status`, `sensitivity`, `created_at`, `updated_at`, `last_validated_at`, `review_after`, optional `valid_from`/`valid_until`, `created_by`, `current_version_id`, optional `retention_policy_id`.

## MemoryVersion
`id`, `memory_item_id`, `version_number`, `content_snapshot`, `change_reason`, `source_event_id`, `created_at`, `created_by`, `validation_record_id`.

## MemorySource
`id`, `memory_item_id`, `source_type`, `source_id`, source version/commit, internal locator, evidence locator/hash, capture time, source authority.

## MemoryRelation
`from_memory_id`, `to_memory_id`, `relation_type` (supports, contradicts, duplicates, supersedes, derived_from, related_to), timestamp, creator.

## MemoryValidation / Feedback / AccessEvent
Store validation checks and evidence references; feedback type (helpful, irrelevant, incorrect, stale, unsafe); and access decisions/reasons. Avoid copying sensitive content into audit logs.

## Storage guidance
- PostgreSQL: canonical records, metadata, versions, relations, permissions, feedback.
- Full-text search: begin with PostgreSQL capabilities.
- Vector index: optional derived index, never the source of truth.
- Artifact Store: large reports/logs; memory stores references.
- Cache: short-lived and permission/version aware; invalidate on correction, revocation, scope changes, or deletion.
- Durable event/outbox: idempotent ingestion and retry support.

## Invariants
1. Active memory always has scope, status, provenance/creator, and timestamps.
2. Restricted content cannot be promoted without policy approval.
3. Duplicate event delivery cannot create duplicate active records.
4. Deleted/revoked items are excluded from retrieval, indexes, and caches.
5. Retrieval returns provenance and validation status when available.
6. Embeddings and caches inherit source access restrictions.
7. Confidence is not a substitute for evidence.
