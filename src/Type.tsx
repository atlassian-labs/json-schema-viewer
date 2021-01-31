import React from 'react';
import styled from 'styled-components';
import { colors } from '@atlaskit/theme';
import { JsonSchema, JsonSchema1 } from './schema';
import { getSchemaFromResult, Lookup } from './lookup';
import { intersperse } from './jsx-util';
import { getOrInferType, isPrimitiveType } from './type-inference';

export type TypeClick = (s: JsonSchema) => void;

export type ClickElementProps = {
  schema: JsonSchema1;
  reference: string;
}

export type ClickElement = React.ElementType<ClickElementProps>;

export type TypeProps = {
  s: JsonSchema | undefined;
  reference: string;
  lookup: Lookup;
  clickElement: ClickElement;
};

function hasCompositeDefinition(s: JsonSchema1): boolean {
  return (s.anyOf !== undefined && s.anyOf.length > 0) ||
    (s.oneOf !== undefined && s.oneOf.length > 0) ||
    (s.allOf !== undefined && s.allOf.length > 0) ||
    (s.not !== undefined);
}

function hasProperties(s: JsonSchema1): boolean {
  return s.properties !== undefined && Object.keys(s.properties).length > 0;
}

function hasPatternProperties(s: JsonSchema1): boolean {
  return s.patternProperties !== undefined && Object.keys(s.patternProperties).length > 0;
}

function hasAdditionalProperties(s: JsonSchema1): boolean {
  return !(typeof s.additionalProperties === 'boolean' && s.additionalProperties === false);
}

export function isClickable(s: JsonSchema): boolean {
  if (typeof s === 'boolean') {
    return false;
  }

  const type = getOrInferType(s);

  return hasProperties(s) || hasPatternProperties(s) || (type === 'object' && hasAdditionalProperties(s));
}

function schemaHasCompositeType(s: JsonSchema1): boolean {
  return (s.allOf !== undefined && s.allOf.length > 0)
    || (s.anyOf !== undefined && s.anyOf.length > 0)
    || (s.oneOf !== undefined && s.oneOf.length > 0)
    || s.not !== undefined;
}

const Container = styled.p`
  margin: 0;
`;

const Plain = styled.span`
  margin: 0px;
  color: ${colors.G400};
`;

const Anything = () => <Plain>anything</Plain>;

type SchemaAndReference = {
  schema: JsonSchema | undefined;
  reference: string;
}

function extractSchemaAndReference(propertyName: string, lookup: Lookup, currentReference: string) {
  return (schema: JsonSchema, arrayIndex: number): SchemaAndReference => {
    const lookupResult = lookup.getSchema(schema);
    return ({
      schema: getSchemaFromResult(lookupResult),
      reference: lookupResult !== undefined && lookupResult.baseReference || `${currentReference}/${propertyName}/${arrayIndex}`
    });
  };
}

function onlyKeyPresent(schema: JsonSchema1, key: keyof JsonSchema1): boolean {
  return Object.keys(schema).every(schemaKey => schemaKey !== key || schema[schemaKey] !== undefined);
}

const getTypeText = (initialSchema: JsonSchema | undefined, lookup: Lookup, initialReference: string, Click: ClickElement): JSX.Element => {
  if (initialSchema === undefined) {
    return <Anything />;
  }

  if (typeof initialSchema === 'boolean') {
     return <Plain>{initialSchema === true ? 'anything' : 'nothing'}</Plain>
  }

  const lookupResult = lookup.getSchema(initialSchema);
  if (lookupResult === undefined) {
    return <Anything />;
  }

  const s = lookupResult.schema;
  const currentReference = lookupResult.baseReference || initialReference;

  if (typeof s === 'boolean') {
    return getTypeText(s, lookup, currentReference, Click);
  }

  const type = getOrInferType(s);

  if (isClickable(s)) {
    return <Click schema={s} reference={currentReference} />;
  }

  if (schemaHasCompositeType(s)) {
    const compositeTypes: JSX.Element[] = new Array<JSX.Element>();

    if (s.anyOf !== undefined && s.anyOf.length > 0) {
      const schemas = s.anyOf.map(extractSchemaAndReference('anyOf', lookup, currentReference));
      // const schemas = mergeCompositesWithParent(s, s.anyOf.map(sx => lookup.getSchema(sx)));

      if (schemas.find(sx => sx.schema === undefined)) {
        // If you have an anything in an anyOf then you should just simplify to anything
        return <Anything />;
      } else {
        const renderedSchemas = schemas.map(sx => getTypeText(sx.schema, lookup, sx.reference, Click));
        if (renderedSchemas.length === 1) {
          compositeTypes.push(renderedSchemas[0]);
        } else {
          const joined = intersperse(renderedSchemas, ', ');

          compositeTypes.push(<Plain>anyOf [{joined}]</Plain>);
        }
      }
    }

    if (s.oneOf !== undefined && s.oneOf.length > 0) {
      const schemas = s.oneOf.map(extractSchemaAndReference('oneOf', lookup, currentReference));

      const renderedSchemas = schemas.map(sx => getTypeText(sx.schema, lookup, sx.reference, Click));
      if (renderedSchemas.length === 1) {
        compositeTypes.push(renderedSchemas[0]);
      } else {
        const joined = intersperse(renderedSchemas, ', ');

        compositeTypes.push(<Plain>oneOf [{joined}]</Plain>);
      }
    }

    if (s.allOf !== undefined && s.allOf.length > 0) {
      const schemas = s.allOf.map(extractSchemaAndReference('allOf', lookup, currentReference));

      const renderedSchemas = schemas.map(sx => getTypeText(sx.schema, lookup, sx.reference, Click));
      if (renderedSchemas.length === 1) {
        compositeTypes.push(renderedSchemas[0]);
      } else {
        const joined = intersperse(renderedSchemas, ', ');

        compositeTypes.push(<Plain>allOf [{joined}]</Plain>);
      }
    }

    if (s.not !== undefined) {
      const lookupResult = lookup.getSchema(s.not);
      const inside = getTypeText(lookupResult?.schema, lookup, lookupResult?.baseReference || `${currentReference}/not`, Click);
      compositeTypes.push(<Plain>not ({inside})</Plain>);
    }

    if (compositeTypes.length === 1) {
      return compositeTypes[0];
    } else if (compositeTypes.length > 1) {
      return <Plain>{intersperse(compositeTypes, ' AND ')}</Plain>;
    }
  } else if (isPrimitiveType(type)) {
    if (Array.isArray(type)) {
      return <Plain>{type.join(' ∪ ')}</Plain>
    }
    return <Plain>{type}</Plain>;
  } else if (type === 'array') {
    if (s.items === undefined) {
      return <Plain>Array&lt;anything&gt;</Plain>;
    } else if (!Array.isArray(s.items)) {
      return <Plain>Array&lt;{getTypeText(s.items, lookup, `${currentReference}/items`, Click)}&gt;</Plain>;
    } else if (s.items.length === 0) {
      return <Plain>Array&lt;anything&gt;</Plain>;
    } else if (s.items.length === 1) {
      return <Plain>Array&lt;{getTypeText(s.items[0], lookup, `${currentReference}/items/0`, Click)}&gt;</Plain>;
    } else {
      const renderedItems = s.items.map((item, i) => getTypeText(item, lookup, `${currentReference}/items/${i}`, Click));
      const joined = intersperse(renderedItems, ', ');

      return <Plain>Array&lt;anyOf [{joined}]&gt;</Plain>;
    }
  } else if (type === 'object') {
    const name = s.title ? s.title : 'object';
    if (isClickable(s)) {
      return <Click schema={s} reference={currentReference} />;
    } else {
      return <Plain>{name}</Plain>;
    }
  } else if (Array.isArray(type)) {
    if (type.length === 0) {
      return <Anything />;
    } else if (type.length === 1) {
      return getTypeText({ ...s, type: type[0] }, lookup, currentReference, Click);
    } else {
      const splitSchemas = type.map(t => ({...s, type: t}));

      const renderedSchemas = splitSchemas.map(splitSchema => getTypeText(splitSchema, lookup, currentReference, Click));
      const joined = intersperse(renderedSchemas, ', ');

      return <Plain>anyOf [{joined}]</Plain>;
    }
  } else if (s.required !== undefined && onlyKeyPresent(s, 'required')) {
    return <Plain>required: {s.required.join(' ∩ ')}</Plain>
  }

  return <Anything />;
};

export const Type: React.FunctionComponent<TypeProps> = ({ s, lookup, reference, clickElement }) => {
  return <Container>{getTypeText(s, lookup, reference, clickElement)}</Container>;
};