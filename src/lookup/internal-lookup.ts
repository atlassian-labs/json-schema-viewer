import { JsonSchema, JsonSchema1 } from "../schema";
import { Lookup, LookupResult } from "./interface";
import { get as pointerGet } from 'jsonpointer';

export class InternalLookup implements Lookup {
  private schema: JsonSchema;

  constructor(schema: JsonSchema) {
    this.schema = schema;
  }

  public async getSchema(schema: JsonSchema): Promise<LookupResult> {
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

    const subResult = await this.getSchema(result);

    if (subResult === undefined) {
      return undefined;
    }

    return {
      schema: subResult.schema,
      baseReference: subResult.baseReference || ref
    };
  }
}