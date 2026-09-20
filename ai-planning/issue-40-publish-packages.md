# Issue #40 — Publish dev-friendly json-schema-viewer packages

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/40. The proposal is to split viewer/editor/faker/toolbar packages for VS Code, CRA, and Docusaurus consumers.

## Current code evidence

The README describes a React SPA deployed to CloudFront and says it “does not build an abstraction layer” (`README.md:42–45`). The package is private and has no library build or package `main`/`exports`; `package.json` contains the browser app scripts and dependencies only. Components import routing and app-specific state directly (for example `SchemaExplorer.tsx` imports `react-router-dom` and route helpers), so extraction is not a packaging-only change.

## Recommendation

Defer the multi-package proposal; supersede it with a narrower, demand-driven embeddable viewer RFC if a concrete consumer appears.

## Rationale and proposed approach if revisited

First define a stable component API (`schema`, `lookup`, base URI, navigation callbacks, theme, hidden toolbar) and separate pure schema semantics from router/network loading. Publish one viewer package with peer dependencies; keep editor/faker/toolbar separate follow-up packages only after owners and use cases exist. Build ESM/CJS/type outputs and verify React 16 compatibility.

## Risks / unknowns

Public API and maintenance commitments are undefined. Splitting now could freeze internal semantics, increase bundle/dependency complexity, and create security obligations around remote loading. Existing SPA behavior and routes must not regress.

## Verification / effort

Validate with one real integration (for example a VS Code webview) and bundle-size/API smoke tests before publishing. Roughly 1–2 weeks for a minimal viewer package; the full four-package plan is a multi-week project.
