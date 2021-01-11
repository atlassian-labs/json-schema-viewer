import { JsonSchema, JsonSchema1 } from './schema';
import { Lookup } from './lookup';
import { isPrimitiveType } from './type-inference';

function extractEnumDirectly(schema?: JsonSchema): JsonSchema1['enum'] {
  if (schema === undefined || typeof schema === 'boolean') {
    return undefined;
  }

  if (typeof schema.enum !== 'undefined' && typeof schema.type !== 'undefined' && isPrimitiveType(schema.type)) {
    return schema.enum;
  }

  return undefined;
}

function extractArrayEnum(schema: JsonSchema, lookup: Lookup): JsonSchema1['enum'] {
  if (typeof schema !== 'boolean' && schema.type === 'array' && schema.items !== undefined && !Array.isArray(schema.items)) {
    return extractEnumDirectly(lookup.getSchema(schema.items));
  }
  return undefined;
}

function runUntilFirstResult<A, B>(inputFunctions: ((a: A) => B | undefined)[], value: A): B | undefined {
  for (let i = 0; i < inputFunctions.length; i++) {
    const potentialResult = inputFunctions[i](value);
    if (typeof potentialResult !== 'undefined') {
      return potentialResult;
    }
  }

  return undefined;
}

export function extractEnum(schema: JsonSchema, lookup: Lookup): JsonSchema1['enum'] {
  const extractors: ((s: JsonSchema) => JsonSchema1['enum'])[] = [
    extractEnumDirectly,
    s => extractArrayEnum(s, lookup)
  ];

  return runUntilFirstResult(extractors, schema);
}