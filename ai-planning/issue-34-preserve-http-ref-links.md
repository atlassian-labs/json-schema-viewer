# Issue #34 — preserve HTTP `$ref` links

Issue: [Links are replacing `http` `$ref` values with `https`](https://github.com/atlassian-labs/json-schema-viewer/issues/34). An HTTP reference such as `http://lvh.me:9876/address_schema.json` is displayed as a viewer URL whose `url` query parameter is HTTPS, breaking local HTTP servers and any endpoint that does not serve TLS.

## Current code evidence

- `src/route-path.ts:19-35` parses external references and unconditionally changes `http:` to `https:` before constructing the viewer URL.
- `src/SchemaExplorer.tsx:395-403` uses `externalLinkTo` for the displayed external `$ref`, so this behavior affects user-facing navigation rather than only a fetch helper.
- `src/LoadSchema.tsx:48-57` fetches the URL from the query string as-is; the rewrite happens earlier when the link is generated.

## Recommendation

Solve now, with a narrow change: preserve the original protocol in the encoded `url` value. Treat production mixed-content handling as a separate deployment/browser concern rather than silently changing resource identity.

## Rationale

The current behavior violates the reference supplied by the schema and makes local development and HTTP-only resources unusable. Silent protocol mutation is especially surprising for a viewer whose job is to follow references. If HTTPS-only hosting needs protection, it should produce a clear error or documented policy, not a different URL.

## Proposed approach

Remove the protocol mutation in `externalLinkTo`. Keep URL parsing, hash extraction, and query encoding unchanged. Add a focused test covering HTTP, HTTPS, and a URL with a fragment; if a production policy is required later, validate it at fetch time with an explicit message.

## Risks / unknowns

Browsers may block HTTP requests from an HTTPS deployment as mixed content; preserving the URL can therefore expose a fetch failure where the current code sometimes appears to work. The application may intentionally have relied on HTTPS upgrade for public references, so confirm expected production policy and document it.

## Verification

Run targeted route-path tests (or add them), manually open an HTTP local schema and confirm the generated `url` remains `http://`, then run `yarn lint` and `yarn test`.

## Rough effort

Small: 0.5–1 day including tests and a manual browser check.
