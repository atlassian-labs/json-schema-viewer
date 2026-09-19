# Issue #26 — support internal non-pointer references

Issue: [Support internal non-pointer references](https://github.com/atlassian-labs/json-schema-viewer/issues/26). Draft 07 schemas can use an internal anchor such as `$id: "#item"` and `$ref: "#item"`; the viewer currently reports `Invalid JSON pointer`.

## Current code evidence

- `src/lookup/index.ts:59-65` strips `#` and passes the remainder directly to `jsonpointer`'s `get`; `#item` is therefore interpreted as a pointer path rather than an anchor.
- `src/lookup/index.ts:67-82` recursively resolves only pointer results and returns a pointer-derived `baseReference`.
- `src/SchemaView.tsx:87` supplies only the root schema to this lookup, so there is no index of `$id` anchors.

## Recommendation

Solve as part of the reference-resolution work, preferably before or alongside #33. It is a bounded Draft 07 compatibility gap and can be implemented without fetching external documents.

## Rationale

Unlike relative external references, internal anchors are local and deterministic. Supporting them fixes a concrete error for valid schemas and gives the broader resolver a clear anchor-indexing foundation.

## Proposed approach

Build an index while traversing the root schema for `$id` values that establish fragment identifiers (including nested scope rules needed by Draft 07), then resolve `#name` by anchor lookup before falling back to JSON Pointer. Keep escaped pointer behavior intact, define duplicate-anchor handling, and retain a canonical base reference for routing/cycle detection. Add fixtures for root and nested anchors, pointer/anchor collisions, missing anchors, and recursive anchors.

## Risks / unknowns

Correct `$id` scoping is subtle, and the issue's cited draft may not match every later Draft 07 detail. Anchors must not be confused with percent-encoded pointer tokens. A partial implementation could silently resolve the wrong schema, so unresolved/duplicate behavior needs explicit tests.

## Verification

Add unit tests around `InternalLookup`, exercise anchor references in `Type`, examples, and navigation, verify old JSON Pointer fixtures, then run `yarn lint` and `yarn test`.

## Rough effort

Medium: 2–5 days for indexing, lookup semantics, and regression coverage; more if folded into the full external resolver.
