import {
  getSchemaFromReference,
  getSchemaFromResult,
  IdLookup,
  InternalLookup,
  loadReference,
} from '../lookup';
import {
  getOrInferType,
  getTypesFromEnum,
  isExternalReference,
  isPrimitiveType,
  jsonTypeToSchemaType,
} from '../type-inference';
import { extractEnum } from '../enum-extraction';
import { shouldShowInStage } from '../stage';
import { JsonSchema, JsonSchema1 } from '../schema';

describe('schema lookup helpers', () => {
  it('passes references through IdLookup but does not resolve them', () => {
    const lookup = new IdLookup();
    const schema: JsonSchema1 = { type: 'string' };
    expect(lookup.getSchema(schema)).toEqual({ schema });
    expect(lookup.getSchema(true)).toEqual({ schema: true });
    expect(lookup.getSchema({ $ref: '#/definitions/value' })).toBeUndefined();
  });

  it('resolves internal pointers, including chains, and records the first reference', () => {
    const root: JsonSchema1 = {
      definitions: {
        value: { $ref: '#/definitions/text' },
        text: { type: 'string' },
      },
    };
    const lookup = new InternalLookup(root);
    expect(lookup.getSchema({ $ref: '#/definitions/value' })).toEqual({
      schema: { type: 'string' },
      baseReference: '#/definitions/text',
    });
    expect(getSchemaFromReference('#/definitions/text', lookup)).toEqual({ type: 'string' });
    expect(getSchemaFromResult(undefined)).toBeUndefined();
    expect(loadReference('#/missing', lookup)).toBeUndefined();
  });

  it('keeps booleans and rejects unsupported, malformed, or external references', () => {
    const lookup = new InternalLookup({ definitions: { yes: true } });
    expect(lookup.getSchema(true)).toEqual({ schema: true });
    expect(lookup.getSchema({ $ref: '#/missing' })).toBeUndefined();
    expect(lookup.getSchema({ $ref: 'other.json#/value' })).toBeUndefined();
    expect(lookup.getSchema({ $ref: '#/definitions/yes' })).toEqual({
      schema: true,
      baseReference: '#/definitions/yes',
    });
  });
});

describe('schema type inference', () => {
  it.each([
    [true, 'boolean'],
    ['text', 'string'],
    [3, 'number'],
    [eval('BigInt(3)'), 'integer'],
    [{}, 'object'],
    [undefined, undefined],
    [null, 'object'],
  ])('maps %p to %p', (value, expected) => {
    expect(jsonTypeToSchemaType(value)).toBe(expected);
  });

  it('deduplicates enum types and preserves mixed enum ordering', () => {
    expect(getTypesFromEnum(['a', 'b'])).toBe('string');
    expect(getTypesFromEnum([1, 2])).toBe('number');
    expect(getTypesFromEnum([1, 'a', false])).toEqual(['number', 'string', 'boolean']);
    expect(getTypesFromEnum([] as unknown as NonNullable<JsonSchema1['enum']>)).toBeUndefined();
  });

  it('infers restrictors in object, array, numeric, string, then enum order', () => {
    expect(getOrInferType({ properties: {} })).toBe('object');
    expect(getOrInferType({ additionalProperties: false })).toBe('object');
    expect(getOrInferType({ items: { type: 'string' } })).toBe('array');
    expect(getOrInferType({ minimum: 0 })).toBe('number');
    expect(getOrInferType({ pattern: 'x' })).toBe('string');
    expect(getOrInferType({ enum: ['x'] })).toBe('string');
    expect(getOrInferType({})).toBeUndefined();
    expect(getOrInferType({ type: 'null', minimum: 0 })).toBe('null');
  });

  it('recognizes primitive unions and only HTTP external references', () => {
    expect(isPrimitiveType(['string', 'null'])).toBe(true);
    expect(isPrimitiveType(['string', 'object'])).toBe(false);
    expect(isPrimitiveType('array')).toBe(false);
    expect(isExternalReference({ $ref: 'https://example.test/schema.json' })).toBe(true);
    expect(isExternalReference({ $ref: 'http://example.test/schema.json' })).toBe(true);
    expect(isExternalReference({ $ref: '//example.test/schema.json' })).toBe(false);
    expect(isExternalReference({ type: 'string' })).toBe(false);
  });
});

describe('enum extraction and read/write stage', () => {
  const directLookup = { getSchema: (schema: JsonSchema) => ({ schema }) };

  it('extracts primitive enums directly and through homogeneous array items', () => {
    expect(extractEnum({ enum: ['draft', 'published'] }, directLookup)).toEqual([
      'draft',
      'published',
    ]);
    expect(extractEnum({ enum: [{ id: 1 }] }, directLookup)).toBeUndefined();
    expect(extractEnum({ type: 'array', items: { enum: ['red', 'blue'] } }, directLookup)).toEqual([
      'red',
      'blue',
    ]);
    expect(
      extractEnum({ type: 'array', items: [{ enum: ['red'] }] }, directLookup)
    ).toBeUndefined();
    expect(extractEnum(true, directLookup)).toBeUndefined();
  });

  it('shows booleans and both-stage schemas, and filters one-sided visibility', () => {
    expect(shouldShowInStage('read', false)).toBe(true);
    expect(shouldShowInStage('both', { readOnly: true })).toBe(true);
    expect(shouldShowInStage('read', { readOnly: true })).toBe(true);
    expect(shouldShowInStage('write', { readOnly: true })).toBe(false);
    expect(shouldShowInStage('write', { writeOnly: true })).toBe(true);
    expect(shouldShowInStage('read', { writeOnly: true })).toBe(false);
    expect(shouldShowInStage('read', { readOnly: true, writeOnly: true })).toBe(true);
    expect(shouldShowInStage('write', {})).toBe(true);
  });
});
