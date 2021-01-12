import React from 'react';
import { JsonSchema } from './schema';
import { Lookup } from './lookup';
import styled from 'styled-components';
import { intersperse } from './jsx-util';
import { ExpandibleList } from './ExpandibleList';
import { Code } from '@atlaskit/code';
import { extractEnum } from './enum-extraction';

const MetadataContainer = styled.div`
    margin: 8px 0 8px 0;
`;

export type ParameterMetadataProps = {
  schema: JsonSchema;
  lookup: Lookup;
};

function turnEnumToValues(schema: JsonSchema, lookup: Lookup): JSX.Element | undefined {
  const potentialEnum = extractEnum(schema, lookup);

  if (potentialEnum === undefined) {
    return undefined;
  }

  return (
    <p key="enum">
      Valid values:&nbsp;
      <ExpandibleList elements={potentialEnum.map(element => ({ element }))} collapsedMaxLength={10} />
    </p>
  );
}

export const ParameterMetadata: React.SFC<ParameterMetadataProps> = (props) => {
  const { schema, lookup } = props;

  const restrictions: JSX.Element[] = new Array<JSX.Element>();
  const validValues = new Array<JSX.Element>();

  function showBoolean(name: string, key: string, value: boolean) {
    return <span key={key}>{name}: <Code language="text" text={value ? 'true' : 'false'} /></span>;
  }

  function show(name: string, key: string, value: string | number) {
    const displayVal = typeof value === 'string' ? value : value.toString();
    return <span key={key}>{name}: <Code text={displayVal} language="text" /></span>;
  }

  if (typeof schema !== 'boolean') {
    if (schema.default !== undefined) {
      const def = schema.default;
      if (typeof def === 'string' || typeof def === 'number') {
        restrictions.push(show('Default', 'default', def));
      } else if (typeof def === 'boolean') {
        restrictions.push(showBoolean('Default', 'default', def));
      }
    }

    if (schema.minItems !== undefined) {
      restrictions.push(show('Min items', 'min-items', schema.minItems));
    }
    if (schema.maxItems !== undefined) {
      restrictions.push(show('Max items', 'max-items', schema.maxItems));
    }
    if (typeof schema.uniqueItems !== 'undefined') {
      restrictions.push(showBoolean('Unique items', 'unique-items', schema.uniqueItems));
    }
    if (schema.minimum !== undefined) {
      const isExclusive = typeof schema.exclusiveMinimum === 'boolean' && schema.exclusiveMinimum;
      restrictions.push(show(`${isExclusive ? 'Exclusive ' : ''}Minimum`, 'minimum', schema.minimum));
    }
    if (schema.maximum !== undefined) {
      const isExclusive = typeof schema.exclusiveMaximum === 'boolean' && schema.exclusiveMaximum;
      restrictions.push(show(`${isExclusive ? 'Exclusive ' : ''}Maximum`, 'maximum', schema.maximum));
    }
    if (typeof schema.exclusiveMinimum === 'number' && schema.minimum === undefined) {
      restrictions.push(show('Exclusive Minimum', 'minimum', schema.exclusiveMinimum));
    }
    if (typeof schema.exclusiveMaximum === 'number' && schema.maximum === undefined) {
      restrictions.push(show('Exclusive Maximum', 'maximum', schema.exclusiveMaximum));
    }
    if (schema.multipleOf !== undefined) {
      restrictions.push(show('Multiple of', 'multiple-of', schema.multipleOf));
    }
    if (schema.minProperties !== undefined) {
      restrictions.push(show('Min properties', 'min-properties', schema.minProperties));
    }
    if (schema.maxProperties !== undefined) {
      restrictions.push(show('Max properties', 'max-properties', schema.maxProperties));
    }
    if (schema.minLength !== undefined) {
      restrictions.push(show('Min length', 'min-length', schema.minLength));
    }
    if (schema.maxLength !== undefined) {
      restrictions.push(show('Max length', 'min-length', schema.maxLength));
    }
    if (typeof schema.pattern !== 'undefined') {
      restrictions.push(show('Pattern', 'pattern', schema.pattern));
    }
    if (typeof schema.format !== 'undefined') {
      restrictions.push(show('Format', 'format', schema.format));
    }

    let potentialEnum = turnEnumToValues(schema, lookup);
    if (potentialEnum !== undefined) {
      validValues.push(potentialEnum);
    }
  }

  return <MetadataContainer>{intersperse(restrictions, ', ')}{validValues}</MetadataContainer>;
};