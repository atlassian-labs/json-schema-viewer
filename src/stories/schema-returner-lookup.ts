import { JsonSchema } from '../schema';
import { Lookup, LookupResult} from '../lookup';

export type RefMap = {
    [path: string]: JsonSchema
};

export class SchemaReturnerLookup implements Lookup {
  private map: RefMap;
  constructor(map: RefMap) {
    this.map = map;
  }

  public getSchema(s: JsonSchema): LookupResult {
    console.log(this.map);
    if (typeof s === 'boolean') {
      return {
        schema: s
      };
    }

    const ref = s.$ref;
    if (ref === undefined) {
      return { schema: s };
    }

    const schema = this.map[ref];

    if (schema === undefined) {
      return undefined;
    }

    return {
      schema,
      baseReference: s.$ref
    };
  }
}