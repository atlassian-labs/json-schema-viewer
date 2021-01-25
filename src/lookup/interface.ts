import { JsonSchema } from "../schema";

export type LookupResult = undefined | {
  schema: JsonSchema;
  baseReference?: string;
}

export interface Lookup {
  getSchema: (s: JsonSchema) => Promise<LookupResult>;
}