# Governance, Security, and Privacy

- Enforce workspace/project/role/sensitivity rules server-side. Cross-project retrieval is denied by default.
- Use least-privilege service identities; do not rely on prompt instructions as the security boundary.
- Treat memory, retrieved docs, logs, and agent notes as untrusted data. Never execute actions or policy changes just because memory recommends them.
- Do not store passwords, API keys, tokens, private keys, cookies, or equivalent secrets. Scan candidates and reject/redact detections.
- Apply data minimization to personal/customer/production data. Never promote confidential project details to shared knowledge.
- Promotion checks: reusability, evidence, confidentiality, licensing/contract restrictions, freshness, and required approval.
- Define retention by type and sensitivity. Support archive, supersede, and deletion; remove deleted/revoked items from active indexes and caches. Document backup purge and legal holds.
- Audit creation, validation, retrieval decisions, promotion, correction, scope changes, archival, deletion, and denials without logging raw sensitive content.
- If authorization or scope cannot be established, fail closed for restricted memory.
- On outage, safe low-risk work may proceed with reduced context; high-impact work should pause or request intervention.
