import { JsonSchema, JsonSchema1 } from './schema';
import { getSchemaFromResult, Lookup } from './lookup';
import { isPrimitiveType } from './type-inference';

async function extractEnumDirectly(schema?: JsonSchema): Promise<JsonSchema1['enum']> {
  if (schema === undefined || typeof schema === 'boolean') {
    return undefined;
  }

  if (typeof schema.enum !== 'undefined' && typeof schema.type !== 'undefined' && isPrimitiveType(schema.type)) {
    return schema.enum;
  }

  return undefined;
}

async function extractArrayEnum(schema: JsonSchema, lookup: Lookup): Promise<JsonSchema1['enum']> {
  if (typeof schema !== 'boolean' && schema.type === 'array' && schema.items !== undefined && !Array.isArray(schema.items)) {
    return extractEnumDirectly(getSchemaFromResult(await lookup.getSchema(schema.items)));
  }
  return undefined;
}

async function runUntilFirstResult<A, B>(inputFunctions: ((a: A) => Promise<B | undefined>)[], value: A): Promise<B | undefined> {
  for (let i = 0; i < inputFunctions.length; i++) {
    const potentialResult = await inputFunctions[i](value);
    if (potentialResult !== undefined) {
      return potentialResult;
    }
  }

  return undefined;
}

export async function extractEnum(schema: JsonSchema, lookup: Lookup): Promise<JsonSchema1['enum']> {
  const extractors: ((s: JsonSchema) => Promise<JsonSchema1['enum']>)[] = [
    extractEnumDirectly,
    s => extractArrayEnum(s, lookup)
  ];

  return runUntilFirstResult(extractors, schema);
}