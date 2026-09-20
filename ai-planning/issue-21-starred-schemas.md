# Issue #21 — Starred Schemas

Issue: [#21](https://github.com/atlassian-labs/json-schema-viewer/issues/21), “Starred Schemas”. The request is a persistent Save/Star list for schemas that users want to revisit; the issue itself notes that this may overlap with Recently viewed.

## Current code evidence

- `src/recently-viewed.ts:12-55` already stores up to 10 schema URLs and titles in `localStorage` under `recently-viewed.v1`.
- `src/LoadSchema.tsx:90-95` automatically adds every successfully loaded schema to that list.
- `src/SchemaApp.tsx:42-55,134-137` exposes a Recently viewed menu, so the basic persistence and navigation UX already exists.

## Recommendation

Defer, and close/supersede with an explicit product decision unless users need durable curation beyond the recent list.

## Rationale

Starred schemas require a second local-storage collection, migration and duplicate-list UX without evidence of demand. Recently viewed already covers the stated “come back later” workflow, while browser-local storage cannot provide cross-device persistence or account-level saves.

## Proposed approach if solving

Add a `starred.v1` store keyed by canonical URL, a star toggle in the loaded-schema navigation, and a Starred menu with remove/empty states. Preserve URL query parameters and handle malformed or unavailable schemas. If cross-device saves are intended, define authentication and a backend first rather than expanding local storage.

## Risks / unknowns

The desired persistence scope (browser, device, or account) is unspecified. URL changes, private schemas, storage quotas, and stale links need policy. A second menu may increase navigation clutter.

## Verification and rough effort

Verify add/remove, reload persistence, duplicate URLs, malformed storage, and navigation to a starred URL in browser tests or Storybook. Local-only implementation: 1–2 days; account-backed implementation: several weeks plus service/security work.
