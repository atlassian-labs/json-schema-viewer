# Issue #5 — `dependencies` in Draft-07

Issue: [#5](https://github.com/atlassian-labs/json-schema-viewer/issues/5), “Support for Dependencies in Draft-07”. It asks for object `dependencies` support and links to the JSON Schema reference.

## Current code evidence

- `ParameterMetadata.tsx:48-108` renders common restrictions but has no `dependencies` handling.
- `Type.tsx:175-233` renders `allOf`, `anyOf`, `oneOf`, and `not`; it does not render or merge the property/schema dependency branches.
- `example.ts` handles object properties and compositions but has no dependency-specific generation path.
- Draft-07 typings are generated from `json-schema.draft-07.json`, so the schema model can be extended from the canonical meta-schema rather than hand-edited.

## Recommendation

Solve now as a display/semantics slice if Draft-07 compatibility is a priority, but split property dependencies and schema dependencies into separate tasks.

## Rationale

Ignoring dependencies can make the displayed object appear valid when a property changes required fields or constraints. The feature is bounded in Draft-07, though examples and composition semantics need careful treatment.

## Proposed approach if solving

Add typed access and lookup for `dependencies`; show human-readable “when property X is present” annotations. Treat array values as conditional required properties and schema values as conditional subschemas. Decide how to combine multiple triggered dependencies and `$ref` branches; add example generation only where deterministic, otherwise annotate rather than invent data.

## Risks / unknowns

Dependencies can cascade and interact with `allOf`/`oneOf`; naïve merging changes meaning. UI wording must distinguish required-property dependencies from schema dependencies. Generated typings must be regenerated, not hand-edited.

## Verification and rough effort

Add fixtures for each dependency kind, cascades, refs, conflicts, and absent/present trigger properties; verify examples and source links. Roughly 3–6 days for a conservative display implementation, 1–2 weeks with full example semantics.
