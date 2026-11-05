import { JsonSchema, JsonSchema1 } from './schema';
import { jsonValueToSchemaType } from './type-inference';

export type SingletonSchemaValue = {
  value: JsonSchema1['const'];
};

/**
 * Returns the single value asserted by a schema, when it has one.
 *
 * `const` is deliberately kept separate from `enum`: it can contain any JSON
 * value, including objects and arrays, while the viewer only treats primitive
 * enums as type/discriminant information.
 */
export function getSingletonSchemaValue(schema: JsonSchema): SingletonSchemaValue | undefined {
  if (typeof schema === 'boolean') {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
    return { value: schema.const };
  }

  if (schema.enum !== undefined && schema.enum.length === 1) {
    return { value: schema.enum[0] };
  }

  return undefined;
}

export function isPrimitiveSchemaValue(value: unknown): boolean {
  const type = jsonValueToSchemaType(value);
  return type !== undefined && ['boolean', 'integer', 'null', 'number', 'string'].includes(type);
}

export function displaySchemaValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  const serialized = JSON.stringify(value);
  return serialized === undefined ? String(value) : serialized;
}
