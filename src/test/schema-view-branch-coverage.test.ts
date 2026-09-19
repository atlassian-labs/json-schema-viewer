jest.mock('../monaco-helpers', () => ({
  MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
  ScrollType: { Smooth: 'smooth' },
}));

import { InternalLookup } from '../lookup';
import { SchemaViewWR } from '../SchemaView';

function pathFor(schema: any, pathname: string, basePathSegments: string[] = ['base']) {
  const view = new SchemaViewWR({
    basePathSegments,
    schema,
    stage: 'both',
    location: { pathname, search: '', hash: '', state: undefined },
    history: {},
    match: {},
  } as any);
  return (view as any).getPathFromRoute(new InternalLookup(schema));
}

describe('SchemaView route path branches', () => {
  test('accepts a path without a leading slash and titles a boolean child schema', () => {
    expect(pathFor({ properties: { anything: true } }, 'base/%23%2Fproperties%2Fanything')).toEqual([
      { reference: '#/properties/anything', title: '<anything>' },
    ]);
  });

  test('uses the fallback title for an unresolved user-provided reference', () => {
    expect(pathFor({ type: 'object' }, '/base/not-a-reference')).toEqual([
      { reference: '#/invalid-reference', title: '<not found>' },
    ]);
  });

  test('stops matching base path segments at the first mismatch', () => {
    expect(pathFor({ type: 'object' }, '/other/%23', ['base', 'nested'])).toEqual([
      { reference: '#/invalid-reference', title: '<not found>' },
      { reference: '#', title: 'object' },
    ]);
  });
});
