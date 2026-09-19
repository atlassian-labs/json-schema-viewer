import { assertExhaustive } from '../exhaustiveness-assertion';
import { exampleSchemas } from '../example-schemas';

describe('small utilities', () => {
  test('assertExhaustive returns the value passed by a completed branch', () => {
    expect(assertExhaustive(undefined as never)).toBeUndefined();
  });

  test('example schemas expose the bundled schema catalogue', () => {
    expect(Object.keys(exampleSchemas)).toEqual([
      'Atlassian schema examples',
      'Schema examples',
      'JSON Schema Meta Schemas',
    ]);
    expect(exampleSchemas['Schema examples']['OpenAPI (v3)']).toContain('OpenAPI-Specification');
  });
});
