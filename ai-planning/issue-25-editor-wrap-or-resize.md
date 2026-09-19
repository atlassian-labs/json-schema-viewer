# Issue #25 — make the code editor usable for wide JSON

Issue: [Make code editor resizable or soft-wrap](https://github.com/atlassian-labs/json-schema-viewer/issues/25). Long strings and deeply nested JSON do not fit in the editor's narrow layout.

## Current code evidence

- `src/SchemaView.tsx:54-55` sets both `min-width` and `max-width` to `500px` for the editor area.
- `src/SchemaEditor.tsx:50-59` configures Monaco but does not pass editor options such as `wordWrap`; the editor is fixed at `height="97vh"`.

## Recommendation

Solve now with soft wrapping enabled by default; consider resizable layout only if users still need horizontal inspection.

## Rationale

Word wrapping directly addresses the reported readability problem with small surface area and no URL/state design. A draggable width adds layout complexity and can reduce the schema panel's usable space. Monaco supports the needed option without changing validation.

## Proposed approach

Pass `options={{ wordWrap: 'on', minimap: { enabled: false } }}` (or the smallest equivalent) to `Editor`, and review whether the 500px container should become responsive at narrow breakpoints. If resize remains desired, add a bounded splitter with keyboard/accessibility support and persist only if product requirements justify it. Add a Storybook case with long strings/deep nesting.

## Risks / unknowns

Wrapping increases vertical scrolling and may make line/marker navigation less obvious. Monaco option typings/version compatibility should be checked. Removing the max width could affect the side-by-side explorer layout.

## Verification

Inspect a long-string and deeply nested fixture at desktop and narrow viewport widths, confirm validation markers and `validationRange` navigation still work, then run `yarn lint`, targeted stories, and `yarn build-prod` if editor bundling changes.

## Rough effort

Small: 0.5–1 day for soft wrap and coverage; 2–4 days for an accessible resizable splitter.
