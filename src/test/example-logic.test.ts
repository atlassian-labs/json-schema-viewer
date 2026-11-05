import { generateJsonExampleFor, isErrors, isExample } from '../example';
import { findDiscriminant } from '../discriminant';
import { InternalLookup } from '../lookup';
import { JsonSchema, JsonSchema1 } from '../schema';

// These tests intentionally use small schemas rather than the large application fixtures.  The
// example generator is pure when paired with InternalLookup, which makes its schema semantics easy
// to exercise without rendering React components.
const example = (schema: any, stage: 'read' | 'write' | 'both' = 'both') => {
  const result = generateJsonExampleFor(schema, new InternalLookup(schema), stage);
  expect(isExample(result)).toBe(true);
  if (!isExample(result)) {
    throw new Error('expected an example');
  }
  return result.value;
};

const errors = (schema: any, stage: 'read' | 'write' | 'both' = 'both') => {
  const result = generateJsonExampleFor(schema, new InternalLookup(schema), stage);
  expect(isErrors(result)).toBe(true);
  if (!isErrors(result)) {
    throw new Error('expected errors');
  }
  return result.errors;
};

describe('generateJsonExampleFor', () => {
  it('uses a matching example before enum, then falls back to a useful primitive default', () => {
    expect(example({ type: 'string', examples: [42, 'from examples'], enum: ['from enum'] })).toBe(
      'from examples'
    );
    expect(example({ type: 'string', enum: ['from enum'] })).toBe('from enum');
    expect(example({ type: 'string' })).toBe('<string>');
    expect(example({ type: 'boolean' })).toBe(true);
    expect(example({ type: 'number', description: 'abc' })).toBe(3);
  });

  it('returns the exact const value, including falsy and structured values', () => {
    expect(example({ const: false, examples: [true], enum: [true] })).toBe(false);
    expect(example({ const: 0 })).toBe(0);
    expect(example({ const: '' })).toBe('');
    expect(example({ const: null })).toBeNull();
    expect(example({ const: { state: 'fixed' } })).toEqual({ state: 'fixed' });
    expect(example({ const: ['fixed'] })).toEqual(['fixed']);
  });

  it('infers object and array types from their constraints', () => {
    expect(example({ properties: { name: { type: 'string' } } })).toEqual({ name: '<string>' });
    expect(example({ items: { type: 'integer' }, minItems: 2 })).toEqual([2154, 2154]);
  });

  it('includes required and optional properties when generating an object example', () => {
    const schema = {
      type: 'object',
      required: ['required'],
      properties: {
        required: {
          type: 'object',
          properties: { nestedOptional: { type: 'string' } },
        },
        optional: { type: 'string' },
      },
    };
    expect(example(schema)).toEqual({
      required: { nestedOptional: '<string>' },
      optional: '<string>',
    });
  });

  it('honours readOnly and writeOnly properties for each generation stage', () => {
    const schema = {
      type: 'object',
      properties: {
        normal: { type: 'string' },
        read: { type: 'string', readOnly: true },
        write: { type: 'string', writeOnly: true },
      },
    };
    expect(example(schema, 'read')).toEqual({ normal: '<string>', read: '<string>' });
    expect(example(schema, 'write')).toEqual({ normal: '<string>', write: '<string>' });
    expect(example(schema, 'both')).toEqual({
      normal: '<string>',
      read: '<string>',
      write: '<string>',
    });
  });

  it('uses array examples, otherwise renders one or minItems values and handles missing items', () => {
    expect(
      example({ type: 'array', examples: [['provided']], items: { type: 'string' }, minItems: 3 })
    ).toEqual(['provided']);
    expect(example({ type: 'array', items: { type: 'string' }, minItems: 2 })).toEqual([
      '<string>',
      '<string>',
    ]);
    expect(
      example({ type: 'array', items: { type: 'string' }, minItems: 4, uniqueItems: true })
    ).toEqual(['<string>']);
    expect(example({ type: 'array' })).toEqual([]);
  });

  it('selects the first anyOf/oneOf branch and merges compatible allOf examples', () => {
    expect(example({ anyOf: [{ type: 'string' }, { type: 'number' }] })).toBe('<string>');
    expect(example({ oneOf: [{ type: 'boolean' }, { type: 'number' }] })).toBe(true);
    expect(
      example({
        allOf: [
          { type: 'object', required: ['first'], properties: { first: { type: 'string' } } },
          { type: 'object', required: ['second'], properties: { second: { type: 'number' } } },
        ],
      })
    ).toEqual({ first: '<string>', second: 2154 });
  });

  it('reports allOf type mismatches, impossible false schemas, and empty type arrays', () => {
    expect(errors({ allOf: [{ type: 'string' }, { type: 'number' }] })[0].reason).toBe(
      'all-of-mismatched-types'
    );
    expect(errors(false)[0].reason).toBe('example-of-nothing-is-impossible');
    expect(errors({ type: [] })[0].reason).toBe('type-array-was-empty');
  });

  it('handles internal references and reports required recursive references', () => {
    const schema = {
      definitions: { node: { type: 'object', properties: { value: { type: 'string' } } } },
      $ref: '#/definitions/node',
    };
    expect(example(schema)).toEqual({ value: '<string>' });

    const recursive = {
      title: 'Node',
      type: 'object',
      required: ['child'],
      properties: { child: { $ref: '#' } },
    };
    expect(errors(recursive)[0].reason).toBe('infinite-prop-loop');
  });

  it('returns a missing-schema error for unsupported external references', () => {
    expect(errors({ $ref: 'https://example.com/schema.json' })[0].reason).toBe('missing-schema');
  });
});

describe('findDiscriminant', () => {
  it('finds a common singleton primitive enum property across object schemas', () => {
    const schemas: [JsonSchema, ...JsonSchema[]] = [
      { type: 'object', properties: { kind: { enum: ['a'] }, value: { type: 'string' } } },
      { type: 'object', properties: { kind: { enum: ['b'] }, value: { type: 'number' } } },
    ];
    expect(findDiscriminant(schemas, new InternalLookup({ anyOf: schemas }))).toBe('kind');
  });

  it('finds a common singleton const property across object schemas', () => {
    const schemas: [JsonSchema, ...JsonSchema[]] = [
      { type: 'object', properties: { kind: { const: 'a' } } },
      { type: 'object', properties: { kind: { const: 'b' } } },
    ];

    expect(findDiscriminant(schemas, new InternalLookup({}))).toBe('kind');
  });

  it('requires the property in every object and rejects non-primitive or non-singleton enums', () => {
    const lookup = new InternalLookup({});
    expect(
      findDiscriminant(
        [
          { type: 'object', properties: { kind: { enum: ['a', 'b'] } } },
          { type: 'object', properties: { kind: { enum: ['c'] } } },
        ],
        lookup
      )
    ).toBeUndefined();
    expect(
      findDiscriminant(
        [
          { type: 'object', properties: { kind: { enum: [{}] } } },
          { type: 'object', properties: { kind: { enum: [{}] } } },
        ],
        lookup
      )
    ).toBeUndefined();
    expect(
      findDiscriminant(
        [
          { type: 'object', properties: { kind: { enum: ['a'] } } },
          { type: 'object', properties: { other: { enum: ['b'] } } },
        ],
        lookup
      )
    ).toBeUndefined();
  });

  it('resolves internal property references and returns undefined for non-object schemas', () => {
    const schema: JsonSchema1 = {
      definitions: { tag: { enum: ['tag-a'] } },
      anyOf: [
        { type: 'object', properties: { kind: { $ref: '#/definitions/tag' } } },
        { type: 'object', properties: { kind: { enum: ['tag-b'] } } },
      ],
    };
    expect(findDiscriminant(schema.anyOf as any[], new InternalLookup(schema))).toBe('kind');
    expect(
      findDiscriminant([{ type: 'string' }, true], new InternalLookup(schema))
    ).toBeUndefined();
  });
});
