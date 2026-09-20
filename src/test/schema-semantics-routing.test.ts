import { externalLinkTo, linkTo, linkToRoot } from '../route-path';
import { findTitle, getTitle } from '../title';

describe('route path helpers', () => {
  it('builds paths with encoded references and preserves an empty base path', () => {
    expect(linkTo([], ['#'])).toBe('/%23');
    expect(linkTo(['view', 'schema'], ['#/properties/a b', '#/definitions/x'])).toBe(
      '/view/schema/%23%2Fproperties%2Fa%20b/%23%2Fdefinitions%2Fx'
    );
    expect(linkToRoot(['view'], 'https://example.test/schema?a=1&b=2')).toBe(
      '/view/%23?url=https%3A%2F%2Fexample.test%2Fschema%3Fa%3D1%26b%3D2'
    );
  });

  it('normalizes HTTP external references to HTTPS and separates hash fragments', () => {
    expect(externalLinkTo([], 'http://example.test/schema.json#/definitions/value')).toBe(
      '/%23%2Fdefinitions%2Fvalue?url=https%3A%2F%2Fexample.test%2Fschema.json'
    );
    expect(externalLinkTo(['view'], 'https://example.test/schema.json')).toBe(
      '/view/%23?url=https%3A%2F%2Fexample.test%2Fschema.json'
    );
    expect(externalLinkTo([], 'https://example.test/schema.json?x=1#part')).toBe(
      '/%23part?url=https%3A%2F%2Fexample.test%2Fschema.json%3Fx%3D1'
    );
    expect(externalLinkTo([], 'not a URL')).toBeNull();
  });
});

describe('schema title fallback helpers', () => {
  it('prefers explicit titles and derives useful property/definition titles', () => {
    expect(findTitle('#/properties/name', { title: 'Display name' })).toBe('Display name');
    expect(findTitle('#/properties/name', {})).toBe('name');
    expect(findTitle('#/definitions/User', {})).toBe('User');
    expect(findTitle('#/properties/tags/items', {})).toBe('tags items');
    expect(findTitle('#/additionalProperties', {})).toBe('(Additional properties)');
    expect(findTitle('#/properties/name/type', {})).toBeUndefined();
    expect(getTitle('#/unknown', {})).toBe('object');
  });

  it('does not mistake similarly named ancestors for the special item fallback', () => {
    expect(findTitle('#/definitions/User/items', {})).toBe('User items');
    expect(findTitle('#/other/items', {})).toBeUndefined();
    expect(findTitle('#/properties/a/items/more', {})).toBeUndefined();
  });
});
