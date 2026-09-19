# Issue #36 — Root definitions omit details for non-object schemas

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/36. A definition such as an enum/string is shown in the Root definitions tree, but clicking it displays only its description rather than enum/value details.

## Current code evidence

`SchemaExplorerDetails` builds property, additional-property, pattern-property, and composite sections (`src/SchemaExplorer.tsx:236–377`), but there is no general primitive/enum/const section. `Type.isClickable` returns true only for properties/pattern properties or object additional properties (`src/Type.tsx:70–77`), so primitive definitions cannot enter the same detail interaction. `getDescriptionForSchema` returns only `schema.description` for ordinary schemas (`src/SchemaExplorer.tsx:223–234`).

## Recommendation

Solve now; this is a contained correctness and navigation gap.

## Proposed approach

Make definition/root entries navigable independent of object clickability, then add a details renderer for constraints/value keywords (type, enum, const, default, examples, min/max where useful). Reuse existing `ParameterView`/`Type` formatting and preserve boolean schemas and composites. Add a story reproducing the Polarization enum and tests for string/number/boolean/null primitives.

## Risks / unknowns

The desired visual layout in the issue screenshots is unavailable in text. Avoid treating every validation keyword as a property; large enums and complex examples need truncation/accessibility.

## Verification / effort

Exercise root definitions with primitive, enum, const, boolean, and composite schemas; run `yarn lint`, tests, and relevant Storybook stories. Rough effort: 1–2 days.
