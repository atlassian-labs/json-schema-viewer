# Testing strategy proposal

## Objective

Build a dependable, layered test suite for the JSON Schema viewer so that changes to schema interpretation, routing, rendering, and security can be made with confidence. The suite should protect user-visible behavior without treating implementation details or Storybook snapshots as the only source of truth.

## Current state

- `yarn test` runs Jest in jsdom with Babel transforms.
- The only automated test is `src/test/markdown-renderer.test.tsx`, which correctly protects raw-HTML sanitization from script, style, and event-handler XSS.
- `yarn lint` provides strict TypeScript checking, and CI also runs a production Webpack build.
- Storybook provides useful manual coverage for `Type`, `SchemaExplorer`, `SchemaView`, `ParameterMetadata`, and navigation, including package.json and OpenAPI fixtures, but it is not exercised automatically.
- Important behavior is concentrated in pure or mostly pure modules: `lookup/index.ts`, `type-inference.ts`, `enum-extraction.ts`, `discriminant.ts`, `example.ts`, `stage.ts`, `route-path.ts`, and `side-nav-loader.ts`.

## Recommendation

Solve in incremental layers, starting with fast unit tests for schema semantics, then adding focused component/integration tests and a small browser smoke suite. Keep Storybook as an exploratory and visual-review tool, but add automated coverage for the highest-risk stories and workflows.

## Proposed approach

### 1. Establish test helpers and fixtures

Add a compact fixture library under `src/test/fixtures/` with independently named Draft-07 schemas. Cover booleans, primitives, objects, arrays, internal `$ref`, external/relative references, recursive schemas, enum/const, `allOf`/`anyOf`/`oneOf`/`not`, `readOnly`/`writeOnly`, and invalid pointers. Prefer small hand-authored schemas over repeated use of the large typed package/OpenAPI fixtures.

Add helpers to build an `InternalLookup`, render components inside a `MemoryRouter`, and assert links while preserving `?url=`. Use behavior-oriented assertions such as visible labels, generated examples, navigation targets, and validation selections.

### 2. Unit-test schema semantics first

Add Jest tests for:

- `InternalLookup` resolution, base references, boolean schemas, missing pointers, nested references, and failure behavior.
- Type inference and enum extraction, including type-less schemas and mixed primitive enums.
- Discriminant detection across union branches.
- Stage filtering for read/write/both, including both flags on a property.
- Route construction and external-reference URL conversion, including fragments, encoding, search preservation, and the deliberate HTTP-to-HTTPS behavior.
- Example generation: defaults/examples/enums, required versus optional properties, `minItems`, composition, recursion, and useful error reasons.

These tests should be deterministic and avoid network access, Monaco, browser storage, and Atlaskit implementation details.

### 3. Add focused component and integration coverage

Use React Testing Library to cover the behavior assembled from those helpers:

- `Markdown`: retain the existing XSS test and add links, fenced code, inline code, and safe raw HTML coverage.
- `LoadSchema`: mock `fetch` for loading, non-OK/invalid JSON errors, URL changes, and recently-viewed persistence.
- `SchemaView`/`SchemaExplorer`: render a rooted schema, follow a property/reference link, verify the selected detail/example tab, and verify the validation-result count and range callback.
- `SchemaEditor`/`SchemaValidator`: mock Monaco at the adapter boundary; assert diagnostics configuration and that selecting a validation row requests the expected range. Do not load the real editor in routine Jest runs.
- Navigation: validate `Start` URL submission and the preservation of the schema URL query across breadcrumbs, side-nav links, and external-reference links.

### 4. Add browser-level smoke checks

Introduce Playwright as a separate CI job or script. Keep it small: serve the production build, load a local schema fixture from a local test server, navigate root → definition → example, load docs, and exercise one Markdown/XSS-safe path. Add a responsive smoke case for the breakpoint where the Monaco editor and side navigation appear.

Browser testing is particularly valuable for Webpack asset loading, the CSP nonce, Monaco, router fallback, and CSS/layout behavior that jsdom cannot validate. It must use local fixtures, never public schema URLs, so CI is reliable and does not issue network requests to user-controlled content.

### 5. Make Storybook testable, not mandatory

Retain existing stories as developer-facing examples. Add stories whenever a bug fix introduces a new schema shape, then promote the highest-value ones into component tests or browser smoke cases. Consider Storybook interaction/a11y tests only after baseline Jest and Playwright coverage is established; visual snapshot infrastructure should be introduced only if a hosted review workflow is approved.

### 6. Enforce in CI progressively

Keep the existing lint, Jest, and production build steps. Add the fast unit/component suite immediately. Add browser smoke tests after they are stable, cache browser dependencies, and publish traces/screenshots only on failure. Initially report coverage rather than gating on a percentage; once the core semantic modules have meaningful coverage, set module-specific thresholds rather than a repository-wide number that encourages low-value tests.

## Test matrix

| Layer | Primary purpose | Examples | CI cadence |
| --- | --- | --- | --- |
| TypeScript | API/type safety | `yarn lint` | Every PR |
| Unit | Schema semantics | lookup, inference, examples, routes, stage | Every PR |
| Component | Accessible UI behavior | Markdown, tabs, links, loader, validator | Every PR |
| Browser smoke | Real browser/build integration | local schema journey, docs, responsive layout | Every PR once stable |
| Storybook | Exploration and visual review | unusual schemas and component states | Local; optional CI later |

## Risks and mitigations

- **Legacy React/Atlaskit compatibility:** use the existing React Testing Library versions initially; update the test stack only in the dependency-modernization workstream.
- **Flaky async UI:** mock `fetch`, storage, timers, and Monaco; use deterministic local fixtures and await visible user outcomes.
- **Overly coupled tests:** assert rendered semantics and URLs, not styled-component class names or private component state.
- **Large schema performance:** reserve package/OpenAPI fixture checks for a small number of integration or browser tests; unit tests use small fixtures.
- **Security regressions:** maintain sanitization tests and add negative cases whenever the Markdown pipeline or CSP changes.
- **Coverage theater:** prioritize decision points and known issue classes over line-count targets.

## Verification and success criteria

1. `yarn lint`, `yarn test`, and `yarn build-prod` remain green locally and in CI.
2. The core semantic modules have focused tests for happy paths and failures, including references, composition, recursion, and schema booleans.
3. At least one integration test proves deep-link/query preservation and one proves sanitized Markdown behavior.
4. A local-fixture browser smoke test proves the production build can load, render, and navigate a schema without external network dependencies.
5. A newly fixed schema-rendering bug can be reproduced by an automated test or an explicitly documented reason is recorded.

## Rough effort

- Fixtures, helpers, and semantic unit tests: 3–5 days.
- Component/integration coverage: 3–5 days.
- Playwright setup and reliable smoke coverage: 2–4 days.
- CI hardening and a first coverage baseline: 1–2 days.

Expect roughly 2–3 weeks of focused engineering work, ideally delivered in small, independently reviewable pull requests rather than one large test rewrite.
