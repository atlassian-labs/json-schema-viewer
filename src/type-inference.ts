import { JsonSchema1 } from './schema';

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

  return undefined;
}