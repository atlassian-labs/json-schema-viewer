import { JsonSchema, JsonSchema1 } from "./schema";

export type WalkerCallback = (schema: JsonSchema1, internalReference: string) => void;

export function walkInternal(root: JsonSchema, callback: WalkerCallback): void {
  walkInternalHelper(root, {
    callback,
    root,
    internalReference: '#'
  })
}

type Context = {
  callback: WalkerCallback;
  root: JsonSchema;
  internalReference: string;
}

function clone(context: Context, relativePath: string): Context {
  return {
    ...context,
    internalReference: context.internalReference + relativePath
  };
}

function walkInternalHelper(schema: JsonSchema, context: Context): void {
  if (typeof schema !== 'boolean') {
    context.callback(schema, context.internalReference);

    // for each of the properties of json schema walk the entries
    if (schema.additionalItems !== undefined) {
      walkInternalHelper(schema.additionalItems, clone(context, '/additionalItems'));
    }

    if (schema.items !== undefined) {
      const items = Array.isArray(schema.items) ? schema.items : [schema.items];
      items.forEach((item, i) => walkInternalHelper(item, clone(context, `/items/${i}`)));
    }

    if (schema.contains !== undefined) {
      walkInternalHelper(schema.contains, clone(context, '/contains'));
    }

    if (schema.additionalProperties !== undefined) {
      walkInternalHelper(schema.additionalProperties, clone(context, `/additionalProperties`));
    }

    for (const key in schema.definitions) {
      if (Object.prototype.hasOwnProperty.call(schema.definitions, key)) {
        const definition = schema.definitions[key];

        walkInternalHelper(definition, clone(context, `/definitions/${key}`));
      }
    }

    for (const key in schema.properties) {
      if (Object.prototype.hasOwnProperty.call(schema.properties, key)) {
        const property = schema.properties[key];

        walkInternalHelper(property, clone(context, `/properties/${key}`));
      }
    }

    for (const key in schema.patternProperties) {
      if (Object.prototype.hasOwnProperty.call(schema.patternProperties, key)) {
        const patternProperty = schema.patternProperties[key];

        walkInternalHelper(patternProperty, clone(context, `/patternProperty/${key}`));
      }
    }

    for (const key in schema.dependencies) {
      if (Object.prototype.hasOwnProperty.call(schema.dependencies, key)) {
        const dependency = schema.dependencies[key];

        if (!Array.isArray(dependency)) {
          walkInternalHelper(dependency, clone(context, `/dependencies/${key}`));
        }
      }
    }

    if (schema.propertyNames !== undefined) {
      walkInternalHelper(schema.propertyNames, clone(context, `/propertyNames`));
    }

    if (schema.if !== undefined) {
      walkInternalHelper(schema.if, clone(context, `/if`));
    }

    if (schema.then !== undefined) {
      walkInternalHelper(schema.then, clone(context, `/then`));
    }

    if (schema.else !== undefined) {
      walkInternalHelper(schema.else, clone(context, `/else`));
    }

    (schema.allOf || []).forEach((item, i) => walkInternalHelper(item, clone(context, `/allOf/${i}`)));

    (schema.anyOf || []).forEach((item, i) => walkInternalHelper(item, clone(context, `/anyOf/${i}`)));

    (schema.oneOf || []).forEach((item, i) => walkInternalHelper(item, clone(context, `/oneOf/${i}`)));

    if (schema.not !== undefined) {
      walkInternalHelper(schema.not, clone(context, `/not`));
    }
  }
}