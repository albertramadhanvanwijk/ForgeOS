# Memory Center UI/UX

Add a shared **Memory Center**, not a separate page for every agent.

## Views
1. **Overview:** active/candidate/stale/conflicted counts, recent activity, retrieval health, evaluation trends. Do not optimize for memory volume.
2. **Explorer:** search/filter by project, scope, type, status, source/agent, verification, sensitivity (authorized users only), and dates.
3. **Detail:** content, clearly labeled generated summary, source/version, scope, status, evidence, confidence caveat, history/relations, permitted retrieval history; correct, mark stale/incorrect, supersede, archive, request promotion, or delete if authorized.
4. **Activity:** captures and changes linked to run/task/artifact.
5. **Review Queue:** contradictions, low-confidence promotion candidates, sensitive-content alerts, stale critical memory, corrections, failed validation.
6. **Analytics:** retrieval relevance, stale-memory hit rate, contradiction rate, cache invalidation latency, capture failures, context tokens, controlled task-outcome impact, cross-scope denial attempts.

## Interaction rules
Confirm destructive actions; explain scope and consequences before promotion/deletion; show why an item was retrieved; never equate stored with verified; provide empty/loading/error/permission-denied states.
