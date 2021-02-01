import { isPresent } from "ts-is-present";
import { Lookup } from "./lookup";
import { JsonSchema } from "./schema";
import { isPrimitiveType, jsonTypeToSchemaType } from "./type-inference";

function isNotString<A>(v: A | string): v is A {
  return typeof v !== 'string';
}

/**
 * For every schema given, it scans through the object schemas and, if there is a property with
 * the same name, with a single enum in each, then we return that property. Otherwise, we return
 * undefined.
 * @param schemas
 * @param lookup
 */
export function findDiscriminant(rawSchemas: Array<JsonSchema>, lookup: Lookup): string | undefined {
  const findResults = rawSchemas.map(rawSchema => findPotentialDiscriminants(rawSchema, lookup)).filter(isNotString);

  if (findResults.length === 0) {
    return undefined;
  }

  const [firstResult, ...remainders] = findResults;

  return Array.from(firstResult).find(propertyName => remainders.every(remainder => remainder.has(propertyName)));
}

function findPotentialDiscriminants(rawSchema: JsonSchema, lookup: Lookup): Set<string> | 'not-object' {
  const lookupResult = lookup.getSchema(rawSchema);

  if (lookupResult === undefined) {
    return 'not-object';
  }

  const { schema } = lookupResult;

  if (typeof schema === 'boolean' || schema.properties === undefined) {
    return 'not-object';
  }

  const { properties } = schema;
  const resolvedProperties = Object.keys(properties).map(propertyName => {
    const lookupResult = lookup.getSchema(properties[propertyName]);
    if (lookupResult === undefined) {
      return undefined;
    }

    return { propertyName, lookupResult };
  }).filter(isPresent);

  return new Set(
    resolvedProperties.filter(property => {
      const propertySchema = property.lookupResult.schema;

      if (typeof propertySchema !== 'boolean' && propertySchema.enum !== undefined && propertySchema.enum.length === 1) {
        const enumValue = propertySchema.enum[0];

        const jsonType = jsonTypeToSchemaType(enumValue);
        if (jsonType !== undefined) {
          return isPrimitiveType(jsonType);
        }
      }

      return false;
    }).map(property => property.propertyName)
  );
}