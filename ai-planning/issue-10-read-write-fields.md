# Issue #10 — Support `writeOnly` and `readOnly` fields

Issue: [#10](https://github.com/atlassian-labs/json-schema-viewer/issues/10), “Support `writeOnly` and `readOnly` fields”. The issue suggests a per-schema setting, represented in the URL rather than a global setting.

## Current code evidence

- `src/stage.ts:3-30` already defines `read`, `write`, and `both`, and correctly filters schemas using `readOnly`/`writeOnly`.
- `src/SchemaExplorer.tsx` accepts a `stage` prop and uses `shouldShowInStage`, but `src/SchemaView.tsx:114` hard-codes `stage="both"`.
- `src/Parameter.tsx:47-62` and `src/ParameterMetadata.tsx:48-108` do not visibly label a field as read-only/write-only.

## Recommendation

Solve now. Most semantic plumbing exists; the missing work is user-selectable scope, URL state, and clear affordances.

## Rationale

The existing stage abstraction substantially reduces implementation risk. Exposing it improves API-schema usability and honors the issue’s per-schema URL requirement without changing default behavior (`both`).

## Proposed approach if solving

Parse a validated `stage=read|write|both` query parameter (default `both`), pass it from `SchemaView` to `SchemaExplorer` and example generation, and include it in preserving links/permalinks. Add a compact selector and badges/tooltips for `readOnly`/`writeOnly`; decide whether filtering should affect examples, navigation, and required markers consistently.

## Risks / unknowns

Generated examples currently use `both` (`SchemaView.tsx:105`), so inconsistent filtering would confuse users. Schemas with both flags are intentionally shown by current logic. Query parsing must preserve the schema `url` query parameter and avoid breaking existing links.

## Verification and rough effort

Add tests for each stage, both flags, URL round-tripping, and example/navigation consistency; add Storybook cases with mixed read/write fields. Roughly 2–4 days.
