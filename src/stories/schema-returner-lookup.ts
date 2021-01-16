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
    if (typeof s === 'boolean' || s.$ref === undefined) {
      return {
        schema: s
      };
    }

    return {
      schema: this.map[s.$ref],
      baseReference: s.$ref
    };
  }
}