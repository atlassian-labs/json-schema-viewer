# Issue #51 — “title are not shown?”

Issue: [#51](https://github.com/atlassian-labs/json-schema-viewer/issues/51) (open; opened 2024-08-23). The reporter says property `title` values are not shown and links to the Hamburg cycling-network schema as a reproduction.

## Current code evidence

`Type.tsx` uses `schema.title` only for object labels in `getObjectName`, and a primitive schema is rendered as its inferred primitive type. `SchemaExplorerDetails` renders a property's key as the primary label and its description/metadata, but has no display for a distinct property-level title. Root navigation labels are generated separately in `SchemaView.tsx`/`SideNavWithRouter.tsx`.

## Recommendation

Solve after confirming the desired precedence and wording against the linked schema. Use a single title-display policy shared by root, definition, and detail views; keep the JSON property key visible because it is the value users must supply.

## Rationale and proposed approach

Avoid adding a title opportunistically to one component. Reproduce with the linked schema, then render a secondary human-facing title in `ParameterView` or `SchemaExplorerDetails` when it differs from the property key, using the existing title resolver for navigation labels. Preserve descriptions and references. Add a story for a titled primitive, object, and definition.

## Risks / unknowns

The issue does not specify whether title should replace or supplement the property key. Duplicate headings, overly verbose property lists, and changed deep-link snapshots are possible.

## Verification / effort

Reproduce from the linked schema, add focused rendering tests/story coverage, run `yarn lint` and `yarn test`. Roughly 0.5–1 day.
