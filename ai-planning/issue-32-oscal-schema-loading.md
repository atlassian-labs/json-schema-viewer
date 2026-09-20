# Issue #32 — OSCAL schema is not loaded

Issue: [OSCAL schema is not loaded](https://github.com/atlassian-labs/json-schema-viewer/issues/32), reporting failure to load the NIST OSCAL complete schema.

## Current code evidence

- `src/LoadSchema.tsx:53-57` performs one direct `fetch(url).then(resp => resp.json())`; it has no response-status check, size/timeout handling, or external-reference loading.
- `src/SchemaView.tsx:87` creates `InternalLookup`, and `src/lookup/index.ts:60-63` rejects every non-`#` reference.
- `src/SchemaExplorer.tsx:397-403` displays external references as links to load separately, so a schema relying on relative/external references cannot render as one resolved document.

## Recommendation

Supersede with the external-reference work proposed for #33, and defer OSCAL-specific support until that resolver exists. Do not add a hard-coded OSCAL exception.

## Rationale

The reported schema is a useful compatibility fixture, but “not loaded” may mean initial fetch failure, a large/complex document, or unresolved references. The current architecture cannot distinguish these causes. Solving the shared document-resolution and diagnostics problem is more maintainable and would also address #26/#33.

## Proposed approach if solving

Capture the exact current OSCAL response/status and inspect its `$ref`/`$id` graph. Add a fixture or integration test, then implement the shared URI-aware resolver, explicit fetch errors, cycle protection, and loading progress/limits. Only after that decide whether OSCAL needs draft/keyword support beyond the documented Draft 07 target.

## Risks / unknowns

The upstream OSCAL URL can change, be unavailable, or require redirects/CORS. Its schema size and reference graph may expose performance limits. OSCAL may use features outside this application's Draft 07 support boundary.

## Verification

Reproduce against a pinned fixture (not only the live URL), verify initial fetch diagnostics and complete rendering, test unresolved references gracefully, then run `yarn lint`, `yarn test`, and `yarn build-prod`.

## Rough effort

Small for diagnosis (0.5–1 day); large for the shared resolver (1–2 weeks, tracked under #33).
