import { JsonSchema } from '../schema';
import { Lookup} from '../lookup';

export type RefMap = {
    [path: string]: JsonSchema
};

export class SchemaReturnerLookup implements Lookup {
  private map: RefMap;
  constructor(map: RefMap) {
    this.map = map;
  }

  public getSchema(s: JsonSchema): JsonSchema | undefined {
    console.log(this.map);
    return typeof s === 'boolean' || s.$ref === undefined ? s : this.map[s.$ref];
  }
}