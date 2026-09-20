# Issue #9 — Generate TypeScript typings

Issue: [#9](https://github.com/atlassian-labs/json-schema-viewer/issues/9), “Consider adding option to generate TypeScript typings for object type(s)”. The request is a button or option to generate types for one object or the whole schema.

## Current code evidence

- `package.json:71` already includes `json-schema-to-typescript` as a devDependency, but no `src/` import or UI action uses it.
- `src/SchemaExplorer.tsx` has code-copy/rendering affordances, making a generated-output panel plausible, but its current output is JSON/YAML/examples.
- `src/LoadSchema.tsx:53-57` and `src/SchemaView.tsx:105` operate on parsed schemas in the browser; no generation service or worker exists.

## Recommendation

Defer as a product feature until demand and output expectations are confirmed; alternatively close as “use the existing generator externally” for now. Do not bundle the build-time generator into the SPA without a size/security review.

## Rationale

Type generation has dialect, `$ref`, `allOf`, nullable/union, naming, and comment-preservation choices. A button implies stable output and download/copy UX, while the existing dependency is tooling-only and not evidence of a supported runtime integration.

## Proposed approach if solving

Define supported Draft-07 subset and naming policy, then run a browser-safe generator in a Web Worker or a separately deployed service. Offer generated output at root and selected object, copy/download, and diagnostics for unsupported constructs. Prefer a versioned library/API contract over importing the devDependency directly into view code.

## Risks / unknowns

Large recursive schemas can block the UI; generated types can be misleading for conditional/composed schemas. `$ref` resolution and external references are intentionally limited by the current viewer. Licensing, bundle size, and untrusted schema resource exhaustion need review.

## Verification and rough effort

Verify representative objects, refs, arrays, enums, compositions, invalid schemas, and large inputs against golden output; test worker cancellation and copy/download. Approximately 1–2 weeks after requirements are agreed.
