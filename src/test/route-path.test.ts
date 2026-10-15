import { externalLinkTo, linkTo, linkToRoot } from '../route-path';

describe('externalLinkTo', () => {
  it('preserves the http: protocol of the referenced URL (issue #34)', () => {
    // $ref: http://lvh.me:9876/address_schema.json
    const link = externalLinkTo(['view'], 'http://lvh.me:9876/address_schema.json');
    expect(link).not.toBeNull();
    expect(link).toBe(`/view/%23?url=${encodeURIComponent('http://lvh.me:9876/address_schema.json')}`);
    // in particular, the generated link must not have silently upgraded http: to https:
    expect(decodeURIComponent(link as string)).toContain('url=http://lvh.me:9876/address_schema.json');
  });

  it('leaves https: URLs unchanged', () => {
    expect(externalLinkTo(['view'], 'https://example.com/schema.json')).toBe(
      `/view/%23?url=${encodeURIComponent('https://example.com/schema.json')}`
    );
  });

  it('moves the URL fragment into the viewer path segment', () => {
    expect(externalLinkTo(['view'], 'http://example.com/schema.json#/definitions/Address')).toBe(
      `/view/${encodeURIComponent('#/definitions/Address')}?url=${encodeURIComponent('http://example.com/schema.json')}`
    );
  });

  it('returns null for URLs that cannot be parsed', () => {
    expect(externalLinkTo(['view'], 'not a url')).toBeNull();
    expect(externalLinkTo(['view'], '#/definitions/local')).toBeNull();
  });
});

describe('linkTo', () => {
  it('builds a viewer path from path segments and references', () => {
    expect(linkTo(['view'], ['#', 'properties', 'name'])).toBe('/view/%23/properties/name');
  });

  it('handles an empty base path', () => {
    expect(linkTo([], ['#'])).toBe('/%23');
  });
});

describe('linkToRoot', () => {
  it('builds a root link preserving the given schema URL', () => {
    expect(linkToRoot(['view'], 'http://example.com/schema.json')).toBe(
      `/view/%23?url=${encodeURIComponent('http://example.com/schema.json')}`
    );
  });
});
