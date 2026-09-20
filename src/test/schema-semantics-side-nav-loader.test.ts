import { extractLinks } from '../side-nav-loader';
import { InternalLookup } from '../lookup';
import { JsonSchema1 } from '../schema';

describe('side navigation link extraction', () => {
  it('returns only the root link for a boolean schema', () => {
    expect(extractLinks(true, new InternalLookup(true))).toEqual([
      { title: 'Root', reference: '#' },
    ]);
  });

  it('includes root, spacer, and owned definition links with title fallbacks', () => {
    const schema: JsonSchema1 = {
      title: 'Catalog',
      definitions: {
        named: { title: 'Named value', type: 'string' },
        untitled: { type: 'object' },
        allowed: true,
      },
    };

    expect(extractLinks(schema, new InternalLookup(schema))).toEqual([
      { title: 'Catalog', reference: '#' },
      { type: 'space' },
      {
        title: 'Root definitions',
        reference: undefined,
        children: [
          { title: 'Named value', reference: '#/definitions/named' },
          { title: 'untitled', reference: '#/definitions/untitled' },
          { title: 'allowed', reference: '#/definitions/allowed' },
        ],
      },
    ]);
  });

  it('does not create a definitions group for an absent or empty definitions object', () => {
    expect(extractLinks({}, new InternalLookup({}))).toEqual([
      { title: 'object', reference: '#' },
      { type: 'space' },
    ]);
    expect(extractLinks({ definitions: {} }, new InternalLookup({ definitions: {} }))).toEqual([
      { title: 'object', reference: '#' },
      { type: 'space' },
      { title: 'Root definitions', reference: undefined, children: [] },
    ]);
  });
});
