import { JsonSchema, JsonSchema1 } from '../schema';
import { get as pointerGet } from 'jsonpointer';

export function getSchemaFromReference(reference: string, lookup: Lookup): JsonSchema | undefined {
  return getSchemaFromResult(loadReference(reference, lookup));
}

export function loadReference(reference: string, lookup: Lookup): LookupResult {
  return lookup.getSchema({ $ref: reference });
}

export function getSchemaFromResult(result: LookupResult): JsonSchema | undefined {
  return result === undefined ? undefined : result.schema;
}

export type LookupResult = undefined | {
  schema: JsonSchema;
  baseReference?: string;
}

export interface Lookup {
  getSchema: (s: JsonSchema) => LookupResult;
}

function isReference(s: JsonSchema1): boolean {
  return s.$ref !== undefined;
}

export class IdLookup implements Lookup {
  public getSchema(schema: JsonSchema): LookupResult {
    if (typeof schema === 'boolean') {
      return { schema };
    }

    if (isReference(schema)) {
      return undefined;
    }

    return { schema };
  }
}

export class InternalLookup implements Lookup {
  private schema: JsonSchema;

  constructor(schema: JsonSchema) {
    this.schema = schema;
  }

  public getSchema(schema: JsonSchema): LookupResult {
    if (typeof schema === 'boolean') {
      return { schema };
    }

    if (schema.$ref === undefined) {
      return { schema };
    }

    const ref = schema.$ref;
    if (!ref.startsWith('#')) {
      // This class does not support non-internal references
      return undefined;
    }

    const result = pointerGet(this.schema, ref.slice(1));

    if (result === undefined) {
      return undefined;
    }

    // TODO add in a type check on the result to ensure that it is of the right type

    const subResult = this.getSchema(result);

    if (subResult === undefined) {
      return undefined;
    }

    return {
      schema: subResult.schema,
      baseReference: subResult.baseReference || ref
    };
  }
}