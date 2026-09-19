# Issue #33 — resolve relative `$ref` values

Issue: [Relative `$ref` not resolving](https://github.com/atlassian-labs/json-schema-viewer/issues/33). The report points to JSON Schema's relative-reference rules and says relative references are not resolving.

## Current code evidence

- `src/lookup/index.ts:43-83` implements `InternalLookup` against one in-memory root and only accepts references beginning with `#`; all other references return `undefined`.
- `src/SchemaView.tsx:87` constructs that lookup from the loaded root schema, while `src/LoadSchema.tsx:48-57` fetches only the one `url` query parameter.
- `src/route-path.ts:19-35` treats an absolute external URL as a link back to the viewer rather than resolving its content in the current schema.

## Recommendation

Defer and supersede with a broader external-reference loading initiative. Relative references require a base document URL, URI resolution, external fetch/caching, error states, and safe navigation; they are not a local pointer-parser fix.

## Rationale

The current architecture deliberately supports internal references and routes external references back through the viewer. Implementing only string joining would still fail for sibling documents, fragments, redirects, cycles, and browser CORS restrictions. A coherent resolver would also cover OSCAL (#32) and reduce duplicated behavior.

## Proposed approach if solving

Introduce a document-aware lookup with an absolute base URI and an async resolver/cache. Resolve relative references with standard URL resolution, fetch external documents through the existing load/error UI, preserve each document's base URI and fragment, and guard cycles/size limits. Keep the current synchronous `Lookup` API behind an adapter or migrate consumers together. Add fixtures for sibling files, nested relative paths, fragments, redirects, and failed/CORS-blocked requests.

## Risks / unknowns

External fetches need CORS and SSRF-style abuse consideration, especially because users supply arbitrary URLs. Navigation and browser history semantics become multi-document. Draft 07 `$id` and nested-base behavior must be specified before implementation.

## Verification

First agree on supported URI/base semantics and security policy. Then add integration tests with a local HTTP fixture server, verify nested and cyclic references, and run `yarn lint`, `yarn test`, and `yarn build-prod`.

## Rough effort

Large: roughly 1–2 weeks for a safe first version, excluding deployment/security review.
