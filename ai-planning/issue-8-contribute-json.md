# Issue #8 — Add `contribute.json`

Issue: [#8](https://github.com/atlassian-labs/json-schema-viewer/issues/8), “Add a contribute.json file”, requesting support for the [contribute.json schema](https://www.contributejson.org/schema).

## Current code evidence

- The repository has contributor-facing `CONTRIBUTING.md` and a GitHub issue link in `src/SchemaApp.tsx:73-76`, but no `contribute.json` file.
- `package.json` is private (`package.json:7`) and deployment is an SPA; there is no existing metadata-generation step.

## Recommendation

Solve now if the project still wants discoverable contribution metadata; otherwise close as superseded by the maintained CONTRIBUTING/GitHub metadata after confirming the format’s current status.

## Rationale

This is isolated documentation metadata with low implementation risk and no runtime impact. Its value depends entirely on the external standard being active and on the fields accurately reflecting this repository.

## Proposed approach if solving

Confirm the current schema and required fields, add a root `contribute.json` containing project name, repository, contribution channels, code of conduct, license, and contribution guide URLs, then validate it in CI against the published schema. Keep secrets, personal contacts, and deployment credentials out of it.

## Risks / unknowns

The schema/site may have changed or become inactive; stale URLs and inaccurate maintainer information would be worse than omission. Decide whether CI should fail on external schema availability or use a pinned copy.

## Verification and rough effort

Validate with the official schema/tool, inspect all links, and run the normal CI checks. Roughly 1–3 hours, plus periodic maintenance.
