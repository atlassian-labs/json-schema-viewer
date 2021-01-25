import { JsonSchema, JsonSchema1 } from '../schema';
import { Lookup, LookupResult } from './interface';
import { get as pointerGet } from 'jsonpointer';
import { WalkerCallback, walkInternal } from '../json-schema-walker';

/*
Test cases to write:

The original schema does not have an $id
A no-op lookup
An internal schema lookup
A remote schema lookup
A cyclic reference lookup
Make sure that the references returned are good
Test external reference that references an internal reference
*/

export type FetchError = {
  errorMessage: string;
};

export type Fetcher = (schemaId: string) => Promise<JsonSchema | FetchError>;

function isFetchError(fetchResult: JsonSchema | FetchError): fetchResult is FetchError {
  return typeof fetchResult !== 'boolean' && 'errorMessage' in fetchResult;
}

function cloneDeep<A>(input: A): A {
  return JSON.parse(JSON.stringify(input));
}

const setIdToInternalReference: (basePath: string) => WalkerCallback = basePath => {
  return (schema, internalRef) => schema.$id = basePath + internalRef;
};

const ORIGINAL_SCHEAMA_KEY = "ORIGINAL_SCHEMA";

/*
If somebody passes in a schema, and it is for an internal reference, how do we know what the current schema is?
One option would be, whenever we load a schema, we walk all references and replace them with full references if
they are not already? That would work really well and it simplifies all of the other logic in the rest of the codebase.
That is pretty good actually.
*/

type CurrentRoot = {
  /**
   * The root JSON Schema that we looked up.
   */
  rootSchema: JsonSchema;
  /**
   * Everything that is not the internal reference.
   */
  basePath: string;
  /**
   * The internal reference within the schema.
   */
  internalRef: string;
};

type Path = {
  basePath: string;
  internalRef: string;
}

function splitPath(url: URL): Path {
  const internalRef = url.hash.length > 0 ? url.hash : '#';
  url.hash = '';
  return {
    internalRef,
    basePath: url.toString()
  };
}

export class InternetLookup implements Lookup {
  private schemasByIdReference: { [schemaId: string]: JsonSchema } = {};

  constructor(originalSchema: JsonSchema, originalUrl: string, private fetcher: Fetcher) {
    const path = splitPath(new URL(originalUrl));
    const clonedSchema = cloneDeep(originalSchema);
    walkInternal(clonedSchema, setIdToInternalReference(path.basePath));
    this.schemasByIdReference[ORIGINAL_SCHEAMA_KEY] = clonedSchema;
    if (typeof originalSchema !== 'boolean' && originalSchema.$id !== undefined) {
      const originalPath = splitPath(new URL(originalSchema.$id));
      this.schemasByIdReference[originalPath.basePath] = clonedSchema;
    }
  }

  public async getSchema(schema: JsonSchema): Promise<LookupResult> {
    if (typeof schema === 'boolean' || schema.$ref === undefined) {
      return { schema };
    }

    // Get the schema to perform the lookup in
    const rootSchemaResult = await this.getCurrentRootSchema(schema.$ref, schema);

    if (rootSchemaResult === undefined) {
      return undefined;
    }

    const { rootSchema, basePath, internalRef } = rootSchemaResult;

    // Perform the lookup in that schema
    const result = pointerGet(rootSchema, internalRef.slice(1));

    if (result === undefined) {
      return undefined;
    }

    // Recurse for multistage references
    // TODO add in a type check on the result to ensure that it is of the right type
    const subResult = await this.getSchema(result);

    if (subResult === undefined) {
      return undefined;
    }

    return {
      schema: subResult.schema,
      baseReference: subResult.baseReference || (basePath + internalRef)
    };
  }

  private async getCurrentRootSchema(ref: string, schema: JsonSchema1): Promise<CurrentRoot | undefined> {
    if (ref.startsWith('#')) {
      if (schema.$id === undefined) {
        return undefined;
      }

      const path = splitPath(new URL(schema.$id));

      const rootSchema = await this.fetchSchema(path.basePath);
      if (rootSchema === undefined) {
        return undefined;
      }
      return {
        ...path,
        rootSchema,
      };
    } else if (ref.startsWith('http')) {
      const path = splitPath(new URL(ref));
      const rootSchema = await this.fetchSchema(path.basePath);
      if (rootSchema === undefined) {
        return undefined;
      }
      return {
        ...path,
        rootSchema
      };
    } else {
      return undefined;
    }
  }

  private async fetchSchema(fetchUrl: string): Promise<JsonSchema | undefined> {
    const cachedSchema = this.schemasByIdReference[fetchUrl];
    if (cachedSchema !== undefined) {
      return cachedSchema;
    }

    const fetchResult = await this.fetcher(fetchUrl);

    if (isFetchError(fetchResult)) {
      return undefined;
    }

    if (typeof fetchResult !== 'boolean' && fetchResult.$id !== undefined) {
      const path = splitPath(new URL(fetchResult.$id));

      if (path.basePath !== fetchUrl) {
        const cloneResult = cloneDeep(fetchResult);
        walkInternal(cloneResult, setIdToInternalReference(path.basePath));
        this.schemasByIdReference[path.basePath] = cloneResult;
      }
    }

    walkInternal(fetchResult, setIdToInternalReference(fetchUrl));
    this.schemasByIdReference[fetchUrl] = fetchResult;

    return fetchResult;
  }
}