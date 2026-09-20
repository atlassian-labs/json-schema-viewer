# Issue #38 — Does not support `const` keyword

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/38. The report says Draft 6+ `const` values are not displayed while `enum` values are.

## Current code evidence

`Type.tsx:117–134` uses titles and single-value `enum` for object names; the discriminant logic only checks `property.enum` (`Type.tsx:122–130`). `SchemaExplorerDetails` renders properties and composites but has no dedicated `const` display. The generated schema typings come from Draft 07, so the keyword should be available after regeneration, but rendering/example logic must be checked separately.

## Recommendation

Solve now as a focused Draft 07 keyword-support fix, ideally alongside a small schema semantics helper so `const` is treated as a singleton allowed value without mutating it into `enum`.

## Proposed approach

Add const handling to the relevant value/type/detail/example paths: display the exact JSON value, use it as a discriminant fallback where appropriate, and ensure falsy values (`false`, `0`, `""`, `null`) work. Add tests/stories for primitive and property `const` values and interactions with `enum`/`oneOf`.

## Risks / unknowns

The expected UI (inline type text versus details panel) is unclear. `const` can contain any JSON value, so string-only rendering and accidental truthiness checks are risks.

## Verification / effort

Run focused Jest/story checks plus `yarn lint`; manually inspect boolean, numeric, null, object, and array constants. Rough effort: 0.5–1 day.
