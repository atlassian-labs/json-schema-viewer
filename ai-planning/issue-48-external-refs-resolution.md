# Issue #48 — External Refs Resolution

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/48. The reporter proposes `json-refs.resolveRefsAt(url)` or a homepage toggle to resolve external `$ref` values.

## Current code evidence

`LoadSchema.tsx:42–47` fetches only the URL and passes the parsed document onward. `SchemaExplorer.tsx:227–229` explicitly describes an external reference as a link, and `Type.tsx:153–155` renders it through a click element. `route-path.ts:19–32` converts an external URI into a new viewer route (and currently upgrades `http` to `https`). Documentation says external references are unsupported (`src/docs/usage.md:10–15`).

## Recommendation

Defer/supersede as a large architectural feature, while retaining the current safe “navigate and load” behavior. Do not add `json-refs` directly to the browser loader without a security and UX design.

## Rationale and proposed approach if revisited

External resolution needs URI base handling, cycles, duplicate fetches, fragment selection, errors, CORS, size limits, and SSRF-like abuse considerations. A future implementation should use a resolver abstraction with memoization and cycle detection, expose unresolved references clearly, and test cross-origin failures and recursive graphs. A user toggle should be explicit and default off until behavior is stable.

## Risks / unknowns

The proposed dependency and browser compatibility are unverified; remote schemas may be mutable or hostile, and eager resolution can dramatically increase requests and payload size. Existing URL/deep-link semantics must remain stable.

## Verification / effort

Before coding, obtain representative external schemas and decide CORS/proxy policy. Then add resolver unit tests, browser integration tests, and documentation. Rough effort: 3–5 days for a constrained resolver, substantially more for production-grade fetching/proxying.
