# Issue #24 — YAML in the Monaco editor

Issue: [Support YAML in the Monaco Editor](https://github.com/atlassian-labs/json-schema-viewer/issues/24). The report asks for a persisted JSON/YAML example choice, a schema-driven default, and YAML validation in Monaco (possibly via `monaco-yaml`).

## Current code evidence

- `src/SchemaExplorer.tsx:425` already models `example-json` and `example-yaml`, and `src/SchemaExplorer.tsx:493-500` renders both formats using `js-yaml`; YAML examples are therefore already available outside the editor.
- `src/SchemaEditor.tsx:51-55` hard-codes Monaco's language to `json`, uses JSON serialization, and registers `languages.json.jsonDefaults` at lines 27-39.
- `src/SchemaView.tsx:121` mounts one editor for the current schema; no format preference is represented in the route or editor props.

## Recommendation

Defer as a product/design decision, then implement as a scoped follow-up if YAML editing is important. Do not add `monaco-yaml` opportunistically: this changes bundle size, worker setup, validation behavior, and the URL/state model.

## Rationale

The viewer already supports YAML output, so the remaining request is an editor mode plus persistence and validation. The issue's “default” requirement is ambiguous: it could mean default display format, editor language, or schema example generation. Clarify that contract before implementation.

## Proposed approach if solving

Define a route query parameter such as `format=json|yaml`, preserve it through `linkTo`/search-preserving navigation, and choose a single canonical parsed value for validation. Add a format toggle in the editor; serialize JSON with existing formatting and YAML with `js-yaml`. Integrate and pin a maintained Monaco YAML provider only after confirming React 16/Monaco worker compatibility, then map YAML diagnostics to editor ranges and add fallback behavior when validation is unavailable.

## Risks / unknowns

YAML has aliases, non-string keys, and multiple scalar representations that do not map cleanly to JSON Schema. A dependency may substantially increase build size or require CSP/worker changes. Persisting format in routes can affect existing deep links and recently viewed URLs.

## Verification

Prototype the dependency in a throwaway branch, validate representative YAML (including invalid syntax and schema errors), verify format query parameters survive navigation, and run `yarn lint`, `yarn test`, and `yarn build-prod`. Add stories for toggle, invalid YAML, and schema validation.

## Rough effort

Medium–large: 4–8 days after requirements are settled, plus dependency/build-risk investigation.
