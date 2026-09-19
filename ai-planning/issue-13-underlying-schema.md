# Issue #13 — Show the underlying schema where applicable

Issue: [#13](https://github.com/atlassian-labs/json-schema-viewer/issues/13), “Show the underlying schema where applicable”. The request arose because some validations are not displayed and viewing the plain schema would help.

## Current code evidence

- `src/LoadSchema.tsx:53-57` fetches JSON and keeps the parsed schema in component state, but does not retain the original source text.
- `src/SchemaView.tsx:105-128` generates an example and renders `SchemaExplorer`; no raw-schema panel is passed through.
- `src/SchemaExplorer.tsx` renders derived descriptions, examples, YAML/JSON code blocks, and validation metadata, while `src/ParameterMetadata.tsx:48-108` covers only a subset of keywords.
- `src/SchemaEditor.tsx:54` displays generated example content, not the loaded schema document.

## Recommendation

Solve now as a narrowly scoped “View source schema” affordance, while separately cataloguing missing keyword coverage. This directly addresses the fallback requested without pretending it fixes semantic gaps.

## Rationale

The application has the parsed object but loses formatting/comments and has no source view. A read-only source panel is useful immediately and avoids blocking on a complete Draft-07 renderer. It should be clearly distinct from the editable example/validator.

## Proposed approach if solving

Fetch and retain response text alongside the parsed JSON, or serialize the parsed schema deterministically when text is unavailable. Add a collapsible, read-only Monaco/code block with copy support at the root, preserving the source URL in navigation. Add a keyword coverage checklist and targeted metadata stories/tests for gaps.

## Risks / unknowns

Fetch responses may be non-JSON, huge, or unavailable after navigation; source formatting may be lost when only parsed JSON is retained. Raw schema is untrusted content and must remain escaped (never render as HTML). Decide whether source is shown at every node or only root.

## Verification and rough effort

Verify source display for formatted JSON, invalid responses, large schemas, and safe characters; confirm existing Markdown sanitization and routing remain unchanged. Approximately 2–4 days for root-only source plus tests.
