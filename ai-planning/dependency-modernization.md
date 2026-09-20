# Dependency modernization proposal

## Status: complete (2026-09-20)

Implemented in `6e78884` and `f6a0e86`. The application now runs on Node 22 with
React 18, current compatible Atlaskit packages, React Router 7, React Markdown
10, Styled Components 6, Monaco 0.56, Jest 30, Webpack 5.111, and Storybook
8.6. Lint, the repository-wide coverage suite, the production build, and the
Storybook build all pass.

React 18, Babel 7, TypeScript 5, Webpack 5, and Storybook 8 are intentional
compatibility boundaries rather than unfinished patch work: moving each to its
newest major would require a separate platform migration outside this proposal.

## Inventory

The root `package.json` pins a 2021-era React 16 / React Router 5 / styled-components 3 application, Atlaskit packages mostly in major versions 0–17, Monaco 0.39, React Markdown 8, and Webpack 5.87. It also has a large Babel/Storybook/Jest/TypeScript toolchain in `devDependencies`. The repository uses Yarn and `yarn.lock`; `.nvmrc` currently targets Node 16.

An npm registry query (`npm outdated --include=dev --json`, run 2026-09-19) reported these representative current/latest values: `react` and `react-dom` 16.14 → 19.3, `react-router-dom` 5.3 → 7.18, `styled-components` 3.4 → 6.5, `react-markdown` 8 → 10, `monaco-editor` 0.39 → 0.56, `jsonpointer` 4.1 → 5.0, `js-yaml` 4.3 → 5.4, `rehype-raw` 6 → 7, `rehype-sanitize` 5 → 6, and `@atlaskit/*` packages with major jumps (for example navigation 0.12 → 6.4, button 15 → 25, menu 0.7 → 11, theme 11 → 28). `@monaco-editor/react`, `react-copy-to-clipboard`, and `ts-is-present` were already at their registry latest in that query.

The command did not emit devDependency rows in this checkout, so Babel, Storybook, Jest, TypeScript, Webpack, and build-plugin latest versions need a second registry audit after dependencies are installed. Treat the values above as metadata captured at planning time, not a lockfile update.

## Current code evidence

- `package.json:30-37` selects React 16, React Markdown 8, Router 5, rehype 6/5, and styled-components 3.
- `package.json:41-80` selects Storybook 7, TypeScript 5.1, Jest 29, Webpack 5.87, and Node 16 via `.nvmrc`.
- `src/SchemaApp.tsx`, `src/SchemaView.tsx`, and routing helpers use React Router 5 APIs (`withRouter`, `useHistory`, `Redirect`, `Switch`); Router 7 is not a drop-in upgrade.
- `src/markdown/index.tsx` relies on the React Markdown/rehype pipeline and is protected by an XSS test, so Markdown upgrades require security regression checks.
- Atlaskit and styled-components components are used throughout; major upgrades can change imports, peer requirements, CSS, and visual behavior.

## Recommendation

Modernize in controlled waves, starting with a supported Node/Yarn baseline and patch/minor updates, then isolate major migrations. Do not perform a blanket “latest” update.

## Rationale

The latest versions span several breaking major releases and likely require coordinated React, Router, Storybook, Atlaskit, styling, Markdown, and TypeScript changes. Smaller waves keep failures attributable and preserve the security-sensitive Markdown and CSP/build behavior.

## Proposed approach

1. Install with the existing lockfile, capture `yarn lint`, `yarn test`, and `yarn build-prod`, and audit all direct/transitive vulnerabilities.
2. Update patch/minor ranges and tooling first; refresh Node only after CI/build compatibility is established.
3. Upgrade React/React DOM and typings as a dedicated wave, preserving React 16 compatibility if Atlaskit requires it.
4. Handle Router 5→6/7 separately, rewriting `withRouter`/history/route APIs and testing deep links plus the `url` query parameter.
5. Upgrade styled-components, Atlaskit, Monaco, Markdown/rehype, and Storybook in separate reviewable waves with Storybook screenshots/manual checks.
6. Regenerate `src/schema.ts` only through `yarn gen-schema`; keep `yarn.lock` authoritative and document intentionally pinned packages.

## Risks / unknowns

Peer dependency conflicts, changed Atlaskit APIs, React 19 lifecycle behavior, Router deep-link regressions, Monaco bundle/CSP changes, Markdown XSS regressions, and Node/OpenSSL build differences are all plausible. Registry “latest” may not align with the browser support policy or Atlassian design system compatibility.

## Verification and rough effort

Every wave should run `yarn lint`, `yarn test`, `yarn build-prod`, and relevant Storybook/manual checks; routing and Markdown waves need focused fixtures. Initial audit: 0.5–1 day. Incremental non-major refresh: 1–3 days. Full React/router/design-system modernization: several weeks and should be treated as a roadmap project.
