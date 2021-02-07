import { JsonSchema1, SimpleTypes } from './schema';
import { isPresent } from 'ts-is-present';

function hasNumericalRestrictor(s: JsonSchema1): boolean {
  return [
    s.minimum,
    s.maximum,
    s.exclusiveMaximum,
    s.exclusiveMinimum,
    s.multipleOf
  ].some(v => v !== undefined);
}

function hasStringRestrictor(s: JsonSchema1): boolean {
  return [
    s.minLength,
    s.maxLength,
    s.pattern
  ].some(v => v !== undefined);
}

function hasObjectRestrictor(s: JsonSchema1): boolean {
  return [
    s.properties,
    s.additionalProperties,
    s.minProperties,
    s.maxProperties
  ].some(v => v !== undefined);
}

function hasArrayRestrictor(s: JsonSchema1): boolean {
  return [
    s.items,
    s.minItems,
    s.maxItems,
    s.uniqueItems
  ].some(v => v !== undefined);
}

export function jsonTypeToSchemaType(someType: unknown): SimpleTypes | undefined {
  switch (typeof someType) {
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'bigint':
      return 'integer';
    case 'object':
      return 'object';
    default:
      return undefined;
  }
}

export function getTypesFromEnum(enumValue: NonNullable<JsonSchema1['enum']>): JsonSchema1['type'] | undefined {
  const types = Array.from(new Set(enumValue.map(jsonTypeToSchemaType).filter(isPresent)));
  if (types.length === 0) {
    return undefined;
  } else if (types.length === 1) {
    return types[0];
  }

  return [types[0], ...types.slice(1)];
}

export function getOrInferType(schema: JsonSchema1): JsonSchema1['type'] | undefined {
  // If the type exists, then just get it
  if (schema.type !== undefined) {
    return schema.type;
  }

  // Otherwise, infer the type from the other restrictors
  if (hasObjectRestrictor(schema)) {
    return 'object';
  }

  if (hasArrayRestrictor(schema)) {
    return 'array';
  }

  if (hasNumericalRestrictor(schema)) {
    return 'number';
  }

  if (hasStringRestrictor(schema)) {
    return 'string';
  }

  if (schema.enum !== undefined) {
    const enumType = getTypesFromEnum(schema.enum);
    if (enumType !== undefined) {
      return enumType;
    }
  }

  return undefined;
}

const primitiveTypes: Array<JsonSchema1['type']> = [
  'boolean',
  'integer',
  'null',
  'number',
  'string'
]

export function isPrimitiveType(type: JsonSchema1['type']): boolean {
  if (Array.isArray(type)) {
    return type.every(t => primitiveTypes.includes(t));
  }
  return primitiveTypes.includes(type);
}

export function isExternalReference(schema: JsonSchema1): boolean {
  return schema.$ref !== undefined && schema.$ref.startsWith('http');
}