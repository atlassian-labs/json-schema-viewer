# json-schema-viewer contributor guide

## Project at a glance

This repository is a private React 16 single-page application for rendering JSON Schema documents. It is built with Webpack, written in strict TypeScript, and uses Atlaskit plus `styled-components` for the UI. The supported schema target is JSON Schema Draft 07.

The application flow is:

```text
BrowserRouter → SchemaApp → LoadSchema → SchemaView
                                      ├→ InternalLookup / reference resolution
                                      ├→ SchemaExplorer / Type / Parameter UI
                                      └→ Monaco editor and validation results
```

Routes are `/start`, `/view/...` (with the source schema URL in `?url=`), and `/docs/:id`. References are encoded into the path, while `search-preserving-link.tsx` deliberately keeps the schema URL query string during in-app navigation.

## Layout and ownership

- `src/index.ts` and `src/BrowserApp.tsx` boot the application and router.
- `src/SchemaApp.tsx`, `Start.tsx`, and `LoadSchema.tsx` own top-level navigation and remote schema loading.
- `src/SchemaView.tsx`, `SchemaExplorer.tsx`, `SideNavWithRouter.tsx`, `Type.tsx`, `Parameter.tsx`, and `ParameterMetadata.tsx` render the schema explorer.
- `src/lookup/`, `type-inference.ts`, `discriminant.ts`, `enum-extraction.ts`, `example.ts`, `stage.ts`, `route-path.ts`, and `title.ts` contain the schema semantics. Prefer adding or changing schema behavior here instead of embedding it in a view.
- `src/markdown/` renders schema descriptions and bundled documentation. It accepts raw HTML only through `rehype-sanitize`; keep sanitization in the rendering pipeline.
- `src/code-block-with-copy/` and the smaller root utilities are reusable UI helpers.
- `src/docs/` contains Markdown loaded by `Docs.tsx` through Webpack asset URLs.
- `src/stories/` is the visual regression/manual-coverage surface. `package.json.ts` and `openapi.json.ts` are large typed schema fixtures; avoid casual edits to them.
- `src/test/` holds Jest tests. The existing Markdown test protects an important XSS boundary.
- `json-schema.draft-07.json` is the source for the generated `src/schema.ts` typings.
- `aws/` and `templates/` package the CloudFront/S3 deployment, Lambda@Edge headers, and copy custom resource. Treat deployment scripts and hard-coded AWS targets as production-facing.

## Setup and routine verification

Use the Node version in `.nvmrc` (currently 16) and Yarn; `yarn.lock` is authoritative. A normal install runs `postinstall`, which generates the ignored `src/schema.ts` from the Draft 07 schema.

```sh
yarn install --frozen-lockfile
yarn lint
yarn test
yarn build-prod
```

Use `yarn start` for the development server and `yarn storybook` for visual component work. Run targeted Jest tests with `yarn test -- <pattern>` when useful. CI runs the four commands above (with `yarn install --frozen-lockfile`).

`yarn build` removes `dist` before producing a production build; do not run it merely for inspection when an existing `dist` directory may matter. `build-and-upload`, `build-and-deploy`, `upload`, and the AWS packaging commands change external infrastructure or production content: do not run them without explicit user authorization.

## Implementation conventions

- Use TypeScript with `strict: true`; `yarn lint` is `tsc --noEmit`, not ESLint.
- Follow the local formatting: Prettier uses single quotes and a 100-character print width. Keep nearby file style when touching legacy code.
- Components are mostly `React.FC`/`React.PureComponent` and co-locate their `styled-components` declarations. Avoid broad UI refactors when making a focused change.
- Model schemas as `JsonSchema` (which can be a boolean) and narrow before accessing object fields. Resolve `$ref` values through the supplied `Lookup`; `InternalLookup` handles only internal `#` references, and external references are intentionally routed back through the viewer.
- Preserve JSON Pointer/reference and URL behavior. Use `linkTo`, `linkToRoot`, `externalLinkTo`, and search-preserving link components rather than hand-building explorer links.
- Keep example generation defensive: it tracks reference chains and intentionally omits optional recursive or unrenderable values. Add a focused test or Storybook case for changed schema semantics, especially references, boolean schemas, compositions (`allOf`/`anyOf`/`oneOf`/`not`), arrays, and read/write visibility.
- New Markdown or rich-description behavior must preserve `rehypeSanitize` and its XSS test coverage. External links need `target="_blank"` with `rel="noopener noreferrer"`.
- Do not hand-edit `src/schema.ts`; regenerate it with `yarn gen-schema` after changing `json-schema.draft-07.json`.

## Change-specific checks

- UI/rendering changes: add or update the nearest Storybook story and inspect it with `yarn storybook` when practical.
- Schema interpretation or example-generation changes: add Jest coverage when feasible, and exercise relevant fixture stories (`Type`, `SchemaExplorer`, or `SchemaView`).
- Routing changes: verify deep links retain the `url` query parameter and correctly encode JSON Pointer fragments.
- Webpack/CSP/Monaco changes: run `yarn build-prod`; the startup nonce and CSP configuration are security-sensitive.
- AWS/template changes: do not deploy as verification. Validate packaging only when requested and keep generated ZIPs/templates untracked.

## Repository hygiene

Keep generated and build artifacts out of commits: `dist/`, `src/schema.ts`, `*.zip`, and `packaged.template` are ignored. Preserve existing working-tree changes and avoid destructive Git operations. Do not push, publish, deploy, or invalidate CloudFront without explicit approval.
