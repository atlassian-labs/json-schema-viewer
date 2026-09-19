# Issue #39 — Run instructions out of order

Issue: [#39](https://github.com/atlassian-labs/json-schema-viewer/issues/39) (open; opened 2022-09-19). The reporter said the README instructed users to run `yarn http-serve` before `dist` had been created, causing `http-server-spa` to fail because its fallback file was absent.

## Current code evidence

Current README setup is ordered as install, optional `yarn gen-schema`, then `yarn start` (`README.md:16–24`). `package.json` runs `gen-schema` automatically in `postinstall`, and `start` invokes webpack-dev-server. There is no `http-serve` script despite older issue reports mentioning that command. The generated `src/schema.ts` is ignored and is required by imports.

## Recommendation

Close as already addressed. The current README's `yarn start` workflow does not depend on a prebuilt `dist`; retain the direct development-server guidance.

## Proposed approach

Before closing, confirm the current README guidance works in a clean checkout. If extra clarity is wanted, document that a static server requires `yarn build-prod` first; do not restore a `http-serve` script or dependency solely for this historical report.

## Risks / unknowns

The main risk is only that an undocumented downstream workflow still expects a static server. It does not justify reintroducing obsolete setup instructions.

## Verification / effort

Run the documented commands in a clean checkout and check generated schema/dev server behavior. Rough effort: 15–30 minutes.
