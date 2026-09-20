# Issue #6 — Support Draft 2020-12

Issue: [#6](https://github.com/atlassian-labs/json-schema-viewer/issues/6), “Support for Draft 2020-12”. The issue is a holding item for newer draft support and anticipates splitting the work.

## Current code evidence

- `README.md:45` and `src/docs/usage.md:5` explicitly say the viewer supports Draft-07.
- `json-schema.draft-07.json` is the source for generated `src/schema.ts`; `package.json:86,100` regenerates it through `json2ts`.
- Rendering and example logic in `src/Type.tsx`, `src/example.ts`, and `src/lookup/` is Draft-07-shaped (for example `definitions`, `$ref`, `allOf`/`anyOf`/`oneOf`), with no dialect or vocabulary dispatch.

## Recommendation

Defer as a major, staged project; do not claim 2020-12 support through a dependency-only update.

## Rationale

2020-12 changes dialect identification, `$defs`, dynamic references, tuple/items semantics, and vocabulary behavior. The current generated types, lookup, examples, links, and docs all assume Draft-07. Partial support would silently misrepresent schemas.

## Proposed approach if solving

First define a dialect abstraction and compatibility matrix. Add dialect detection and fixtures, regenerate typings from the 2020-12 meta-schema, then update lookup/reference resolution (`$defs`, anchors/dynamic refs), type inference, examples, compositions, and UI metadata. Ship incrementally with an explicit unsupported-keyword warning and retain Draft-07 behavior.

## Risks / unknowns

External references and dynamic scope are currently limited; browser fetch/CORS and resource exhaustion become more important. Draft support needs conformance fixtures and product decisions for vocabularies not representable in the current UI.

## Verification and rough effort

Run official 2020-12 test suites where applicable, fixture stories, type-check, Jest, and production build; verify Draft-07 regressions. Rough estimate: 3–6 weeks for a focused subset, longer for broad conformance.
