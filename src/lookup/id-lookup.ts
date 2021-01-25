import { JsonSchema } from "../schema";
import { isReference } from "./helpers";
import { Lookup, LookupResult } from "./interface";

/**
 * A lookup object that is really useful for testing and storybooks. It will treat all references as impossible to lookup
 * and it will return non-reference schemas as they were input to this class.
 *
 * This is not meant for production usage as it does not actually perform lookups. It is meant for tests and Storybooks.
 */
export class IdLookup implements Lookup {
  public async getSchema(schema: JsonSchema): Promise<LookupResult> {
    if (typeof schema === 'boolean') {
      return { schema };
    }

    if (isReference(schema)) {
      return undefined;
    }

    return { schema };
  }
}