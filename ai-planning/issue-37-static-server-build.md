# Issue #37 — Static server fallback/build failure

Issue: https://github.com/atlassian-labs/json-schema-viewer/issues/37. The report shows `http-server-spa dist index.html 8080` failing because the fallback is absent, and webpack failing on Node 17 with `digital envelope routines::unsupported`; Node 16 resolved it.

## Current code evidence

The current README no longer documents `http-serve`; it documents `yarn start` (`README.md:18–24`). `package.json` has `build`, `build-prod`, and `start`, but no `http-serve` script. Webpack uses an older toolchain with chunk hashes (`webpack.common.js:30–33`), while `.nvmrc` pins Node 16.

## Recommendation

Close/supersede as stale if the current repository intentionally supports Node 16 and no static-server command exists; retain a brief README note about `.nvmrc`. Reopen only if current supported Node versions reproduce the hash failure.

## Rationale / proposed approach if reopened

Do not add a fallback server solely for an obsolete command. If supporting modern Node is desired, upgrade/configure webpack hashing or document `NODE_OPTIONS=--openssl-legacy-provider` only as a temporary measure, then add a tested static preview script that checks `dist/index.html` exists.

## Risks / unknowns

The report may refer to a historical README and an environment outside the current support matrix. Toolchain upgrades can affect CSP, Monaco, asset hashes, and production output.

## Verification / effort

Run `yarn build-prod` on the declared Node version and a current LTS in CI/clean checkout. Rough effort: 1 hour to close/document; 1–3 days if modern-Node support is required.
