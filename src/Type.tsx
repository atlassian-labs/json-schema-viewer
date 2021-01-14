import React from 'react';
import styled from 'styled-components';
import { colors } from '@atlaskit/theme';
import { JsonSchema, JsonSchema1 } from './schema';
import { Lookup } from './lookup';
import { intersperse } from './jsx-util';
import { getOrInferType, isPrimitiveType } from './type-inference';

export type TypeClick = (s: JsonSchema) => void;

export type TypeProps = {
  s: JsonSchema | undefined;
  lookup: Lookup;
  onTypeClick: TypeClick;
};

export function isClickable(s: JsonSchema): boolean {
  if (typeof s === 'boolean') {
    return false;
  }

  return (s.properties && Object.keys(s.properties).length > 0) ||
        !(typeof s.additionalProperties === 'boolean' && s.additionalProperties === false);
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

const Clickable = styled.a`
  margin: 0px;
  color: rgb(7, 71, 166);
  cursor: pointer;
`;

const Anything = () => <Plain>anything</Plain>;

// function mergeCompositesWithParent(parent: JsonSchema1, children: Array<JsonSchema | undefined>): Array<JsonSchema | undefined> {
//   return children.map(child => {
//     if (child === undefined) {
//       return undefined;
//     }

//     if (typeof child === 'boolean') {
//       return child;
//     }

//     return {
//       title: parent.title,
//       type: parent.type,
//       ...child
//     };
//   })
// }

const getTypeText = (s: JsonSchema | undefined, lookup: Lookup, onTypeClick: TypeClick): JSX.Element => {
  if (s === undefined) {
    return <Anything />;
  }

  if (typeof s === 'boolean') {
     return <Plain>{s === true ? 'anything' : 'nothing'}</Plain>
  }

  const type = getOrInferType(s);

  if (schemaHasCompositeType(s)) {
    const compositeTypes: JSX.Element[] = new Array<JSX.Element>();

    if (s.anyOf !== undefined && s.anyOf.length > 0) {
      const schemas = s.anyOf.map(sx => lookup.getSchema(sx));
      // const schemas = mergeCompositesWithParent(s, s.anyOf.map(sx => lookup.getSchema(sx)));

      if (schemas.find(sx => sx === undefined)) {
        // If you have an anything in an anyOf then you should just simplify to anything
        return <Anything />;
      } else {
        const renderedSchemas = schemas.map(sx => getTypeText(sx, lookup, onTypeClick));
        if (renderedSchemas.length === 1) {
          compositeTypes.push(renderedSchemas[0]);
        } else {
          const joined = intersperse(renderedSchemas, ', ');

          compositeTypes.push(<Plain>anyOf [{joined}]</Plain>);
        }
      }
    }

    if (s.oneOf !== undefined && s.oneOf.length > 0) {
      const schemas = s.oneOf.map(sx => lookup.getSchema(sx));

      const renderedSchemas = schemas.map(sx => getTypeText(sx, lookup, onTypeClick));
      if (renderedSchemas.length === 1) {
        compositeTypes.push(renderedSchemas[0]);
      } else {
        const joined = intersperse(renderedSchemas, ', ');

        compositeTypes.push(<Plain>oneOf [{joined}]</Plain>);
      }
    }

    if (s.allOf !== undefined && s.allOf.length > 0) {
      const schemas = s.allOf.map(sx => lookup.getSchema(sx));

      const renderedSchemas = schemas.map(sx => getTypeText(sx, lookup, onTypeClick));
      if (renderedSchemas.length === 1) {
        compositeTypes.push(renderedSchemas[0]);
      } else {
        const joined = intersperse(renderedSchemas, ', ');

        compositeTypes.push(<Plain>allOf [{joined}]</Plain>);
      }
    }

    if (s.not !== undefined) {
      const inside = getTypeText(lookup.getSchema(s.not), lookup, onTypeClick);
      compositeTypes.push(<Plain>not ({inside})</Plain>);
    }

    if (compositeTypes.length === 1) {
      return compositeTypes[0];
    } else if (compositeTypes.length > 1) {
      return <Plain>{intersperse(compositeTypes, ' AND ')}</Plain>;
    }
  } else if (isPrimitiveType(type)) {
    return <Plain>{type}</Plain>;
  } else if (type === 'array') {
    const items: Array<JsonSchema> | undefined = s.items === undefined || Array.isArray(s.items) ? s.items : [s.items];
    if (items === undefined || items.length === 0) {
      return <Plain>Array&lt;anything&gt;</Plain>;
    } else {
      const joinedSchema: JsonSchema = {
        anyOf: [items[0], ...items.slice(1)]
      };

      return <Plain>Array&lt;{getTypeText(joinedSchema, lookup, onTypeClick)}&gt;</Plain>;
    }
  } else if (type === 'object') {
    const name = s.title ? s.title : 'object';
    if (isClickable(s)) {
      return <Clickable onClick={() => onTypeClick(s)}>{name}</Clickable>;
    } else {
      return <Plain>{name}</Plain>;
    }
  } else if (Array.isArray(type)) {
    if (type.length === 0) {
      return <Anything />;
    } else if (type.length === 1) {
      return getTypeText({ ...s, type: type[0] }, lookup, onTypeClick);
    } else {
      const splitSchemas = type.map(t => ({...s, type: t}));

      const joinedSchema: JsonSchema = {
        anyOf: [splitSchemas[0], ...splitSchemas.slice(1)]
      };

      return getTypeText(joinedSchema, lookup, onTypeClick);
    }
  }

  return <Anything />;
};

export const Type: React.FunctionComponent<TypeProps> = ({ s, lookup, onTypeClick }) => {
  return <Container>{getTypeText(s, lookup, onTypeClick)}</Container>;
};