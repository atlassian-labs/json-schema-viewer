# Issue #31 — merge a property's single `allOf` subschema

Issue: [Support for merging property schema with single allOf subschema](https://github.com/atlassian-labs/json-schema-viewer/issues/31). A property-level default is currently shown, but the referenced enum/type/description inside a singleton `allOf` is not fully documented.

## Current code evidence

- `src/SchemaExplorer.tsx:345-365` renders `allOf` as a separate “Mixins” block and does not merge its keywords into the property's details.
- `src/Type.tsx:210-220` renders singleton `allOf` as a type expression; it does not combine parent annotations such as `default` with the resolved child schema.
- `src/example.ts:400-426` separately evaluates all `allOf` members, so example generation already recognizes the composition and must remain semantically consistent.
- Existing story coverage includes `Singleton allOf` (`src/stories/SchemaExplorer.stories.tsx:273+`).

## Recommendation

Solve now, narrowly for a single `allOf` member, while retaining composition semantics for multiple members.

## Rationale

This is a common output shape (including Pydantic) and the requested behavior is useful without requiring a general schema merger. A narrow normalization step can improve documentation while avoiding unsafe “merge every allOf” assumptions.

## Proposed approach

Add a semantic helper that, when a schema has exactly one `allOf` member, resolves that member and overlays presentation/instance-local keywords from the parent (notably `default`, title, description, and examples) without mutating the source. Use the normalized view consistently in `SchemaExplorer`, `Type`, enum extraction, and example generation; preserve an explicit `allOf` display when constraints conflict or resolution fails. Extend the existing story and add focused tests for inline and `$ref` members, parent defaults, booleans, and unresolved references.

## Risks / unknowns

JSON Schema annotations and assertion keywords have nuanced combination rules; a generic object spread would be incorrect. `$ref` siblings differ across dialects, and defaults are annotations rather than assertions. Avoid claiming validation-equivalent flattening.

## Verification

Compare inline, direct `$ref`, and singleton-`allOf` fixtures; verify each property keeps its own default and enum, recursive references remain safe, and multi-member `allOf` output is unchanged. Run the focused Jest/story checks, `yarn lint`, and `yarn test`.

## Rough effort

Medium: 2–4 days including semantic helper, regression tests, and story review.
