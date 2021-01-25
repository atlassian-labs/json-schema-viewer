import { JsonSchema, JsonSchema1 } from "../schema";
import { Lookup, LookupResult } from "./interface";

export async function getSchemaFromReference(reference: string, lookup: Lookup): Promise<JsonSchema | undefined> {
  return getSchemaFromResult(await loadReference(reference, lookup));
}

export function loadReference(reference: string, lookup: Lookup): Promise<LookupResult> {
  return lookup.getSchema({ $ref: reference });
}

export function getSchemaFromResult(result: LookupResult): JsonSchema | undefined {
  return result === undefined ? undefined : result.schema;
}

export function isReference(s: JsonSchema1): boolean {
  return s.$ref !== undefined;
}