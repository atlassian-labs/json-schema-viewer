# Issue #35 — VS Code previewer for JSON Schema

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/35. The requester wants to embed this viewer in a VS Code extension, without the upload/navigation bar, and notes that the app is not consumable as a library.

## Current code evidence

The project is explicitly a React SPA with URL-driven loading (`README.md:42–45`; `LoadSchema.tsx:42–47`), and routing is woven through explorer components (`SchemaExplorer.tsx` imports router and route helpers). `package.json` is private and exposes no library build or exports. The top-level flow owns remote fetches and navigation, so a VS Code host cannot simply pass a schema object today.

## Recommendation

Defer as a product integration, and supersede with issue #40’s narrower embeddable-viewer RFC if a maintainer commits to library support. Do not build a VS Code extension in this repository without an owner and packaging decision.

## Proposed approach if prioritized

Extract a router-independent `SchemaViewer` component accepting schema, lookup/base URI, navigation callbacks, and `hideToolbar`; keep `SchemaApp`/`LoadSchema` as the web adapter. Publish typed ESM/CJS artifacts and provide a minimal VS Code webview host that reads the active document and handles CSP/assets. Share semantic/rendering code with the SPA.

## Risks / unknowns

VS Code webview CSP, Monaco loading, React version, bundle size, and local `$ref` resolution need design. A library API would become a compatibility commitment and may expose current internal types.

## Verification / effort

Prototype with one webview fixture, test schema injection and navigation, run production bundle/CSP checks, and verify the existing SPA. Rough effort: 1–2 weeks for a minimal previewer after API extraction; more for a polished extension.
