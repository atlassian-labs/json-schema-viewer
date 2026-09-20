# Issue #4 — Draft-07 `if` / `then` / `else`

Issue: [#4](https://github.com/atlassian-labs/json-schema-viewer/issues/4), “Support: if-then-else in Draft-07 (conditionals)”. It requests rendering schemas that use JSON Schema conditionals.

## Current code evidence

- `Type.tsx:175-233` has explicit branches for `anyOf`, `oneOf`, `allOf`, and `not`, but none for `if`, `then`, or `else`.
- `example.ts:396-437` chooses/merges composition branches but does not evaluate conditional branches against an example instance.
- `ParameterMetadata.tsx:48-108` has no conditional annotation; `SchemaExplorer.tsx` therefore cannot explain the condition to users.

## Recommendation

Defer until a schema-logic design is agreed, then solve as a staged feature. Do not silently flatten conditionals into an unconditional union.

## Rationale

`if` is an assertion evaluated against an instance, while `then`/`else` apply conditionally. A viewer can describe the branches, but a single static type/example may be wrong without a selected discriminator or instance. Correctly merging required/properties/constraints is non-trivial.

## Proposed approach if solving

Add a conditional renderer that labels the predicate and branches, links each branch, and presents conservative “if condition, then…” text. Reuse a validator/evaluator for optional example instances; only specialize examples when the predicate can be proven. Keep `if` without `then`/`else` visible as an annotation.

## Risks / unknowns

Nested conditionals, `not`, refs, and contradictory branches can explode combinations. The current example generator intentionally uses defensive heuristics, so conditional evaluation could affect performance and misleading output. Need a policy for validation errors and branch selection.

## Verification and rough effort

Create fixtures for true/false predicates, omitted branches, nested conditionals, refs, and conflicting constraints; test rendering and examples against a validator. Roughly 1–2 weeks for conservative display, longer for full evaluation.
