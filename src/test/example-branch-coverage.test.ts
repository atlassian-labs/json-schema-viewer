import {
  Error as ExampleError,
  Errors,
  generateJsonExampleFor,
  isErrors,
  isExample,
} from '../example';
import { InternalLookup, Lookup } from '../lookup';

// These cases deliberately exercise the defensive branches in the example generator.  The
// existing example tests cover the common happy paths; this file focuses on malformed schemas,
// reference chains, and errors returned by nested schemas.
const resultFor = (
  schema: any,
  lookup: Lookup = new InternalLookup(schema),
  stage: 'read' | 'write' | 'both' = 'both'
) => generateJsonExampleFor(schema, lookup, stage);

const valueFor = (schema: any, lookup?: Lookup) => {
  const result = resultFor(schema, lookup);
  expect(isExample(result)).toBe(true);
  if (!isExample(result)) {
    throw new globalThis.Error('expected an example');
  }
  return result.value;
};

const errorReasons = (schema: any, lookup?: Lookup) => {
  const result = resultFor(schema, lookup);
  expect(isErrors(result)).toBe(true);
  if (!isErrors(result)) {
    throw new globalThis.Error('expected errors');
  }
  return result.errors.map((error) => error.reason);
};

describe('example generator defensive and branch behavior', () => {
  test('exposes value and error collection accessors', () => {
    const example = resultFor({ type: 'string', examples: ['value'] });
    expect(isExample(example) && example.value).toBe('value');

    const error = new ExampleError('schema-not-supported', 'unsupported');
    const errors = Errors.of(error);
    expect(error.message).toBe('unsupported');
    expect(errors.errors).toEqual([error]);
    expect(errors.length).toBe(1);
    expect(Errors.from(Errors.of(), errors).errors).toEqual([error]);
  });

  test('handles permissive schemas, empty type arrays, and inferred object schemas', () => {
    const permissive = resultFor(true);
    expect(isExample(permissive) && permissive.value).toEqual({});
    expect(valueFor({})).toEqual({});
    expect(errorReasons({ type: [] })).toEqual(['type-array-was-empty']);
    expect(valueFor({ type: ['string', 'number'] })).toBe('<string>');
    expect(valueFor({ type: 'object' })).toEqual({});
    expect(valueFor({ type: 'object', examples: [{ provided: true }] })).toEqual({
      provided: true,
    });
  });

  test('covers primitive enum fallbacks and array item failure branches', () => {
    expect(valueFor({ type: 'boolean', enum: [false] })).toBe(false);
    expect(valueFor({ type: 'number', examples: ['wrong'], enum: [7] })).toBe(7);
    expect(valueFor({ type: 'number', examples: ['wrong'] })).toBe(2154);
    expect(errorReasons({ type: 'array', items: [] })).toEqual(['ran-out-of-memory']);
    expect(valueFor({ type: 'array', items: false })).toEqual([]);
    expect(valueFor({ type: 'array', items: { $ref: '#/missing' } })).toEqual([]);
  });

  test('omits optional recursive array references while preserving non-recursive references', () => {
    const schema = {
      definitions: { item: { type: 'string' } },
      type: 'array',
      items: { $ref: '#/definitions/item' },
    };
    expect(valueFor(schema)).toEqual(['<string>']);

    const recursive = {
      definitions: { node: { type: 'array', items: { $ref: '#/definitions/node' } } },
      $ref: '#/definitions/node',
    };
    expect(valueFor(recursive)).toEqual([]);
  });

  test('handles boolean properties, missing properties, and nested optional properties', () => {
    const schema = {
      type: 'object',
      required: ['allowed', 'forbidden', 'missing'],
      properties: {
        allowed: true,
        forbidden: false,
        missing: { $ref: '#/missing' },
        optionalMissing: { $ref: '#/also-missing' },
      },
    };
    expect(errorReasons(schema)).toEqual([
      'example-of-nothing-is-impossible',
      'missing-schema',
      'missing-schema',
    ]);

    const nested = {
      definitions: { child: { type: 'object', properties: { optional: { type: 'string' } } } },
      type: 'object',
      properties: { child: { $ref: '#/definitions/child' } },
    };
    expect(valueFor(nested)).toEqual({ child: {} });
  });

  test('reports all-of missing schemas and nested errors, and merges boolean examples', () => {
    expect(errorReasons({ allOf: [{ $ref: '#/missing' }] })).toEqual(['missing-schema']);
    expect(errorReasons({ allOf: [{ type: 'string' }, false] })).toEqual([
      'example-of-nothing-is-impossible',
    ]);
    expect(
      valueFor({
        allOf: [
          { type: 'boolean', examples: [false] },
          { type: 'boolean', examples: [true] },
        ],
      })
    ).toBe(false);
    expect(
      valueFor({
        allOf: [
          { type: 'string', examples: ['first'] },
          { type: 'string', examples: ['second'] },
        ],
      })
    ).toBe('first');
  });

  test('falls back to a descriptive unsupported-schema error', () => {
    expect(errorReasons({ title: 'Untyped' })).toEqual(['schema-not-supported']);
    expect(
      errorReasons({ $ref: '#/definitions/untyped', definitions: { untyped: { title: 'Nested' } } })
    ).toEqual(['schema-not-supported']);
  });

  test('converts lookup exceptions into a stable error result', () => {
    const throwingLookup: Lookup = {
      getSchema: () => {
        throw new globalThis.Error('lookup failed');
      },
    };
    expect(errorReasons({ type: 'string' }, throwingLookup)).toEqual(['ran-out-of-memory']);
  });
});
