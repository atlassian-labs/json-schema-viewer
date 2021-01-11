import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { IdLookup } from '../lookup';
import { ParameterMetadata, ParameterMetadataProps } from '../ParameterMetadata';

export default {
  title: 'JsonSchema/ParameterMetadata',
  component: ParameterMetadata,
  argTypes: {
  },
} as Meta;

const defaultProps = {
  lookup: new IdLookup()
};

const Template: Story<ParameterMetadataProps> = (args) => <ParameterMetadata {...args} />;

export const ItemRestrictors = Template.bind({});
ItemRestrictors.args = {
  ...defaultProps,
  schema: {
    minItems: 1,
    maxItems: 10,
    uniqueItems: true
  }
};

export const NoMaxItem = Template.bind({});
NoMaxItem.args = {
  ...defaultProps,
  schema: {
    minItems: 1,
    uniqueItems: true
  }
};

export const NoMinItem = Template.bind({});
NoMinItem.args = {
  ...defaultProps,
  schema: {
    maxItems: 10,
    uniqueItems: true
  }
};

export const NumericalRestrictors = Template.bind({});
NumericalRestrictors.args = {
  ...defaultProps,
  schema: {
    multipleOf: 5,
    minimum: 10,
    maximum: 10000,
    exclusiveMinimum: false,
    exclusiveMaximum: true
  }
};

export const NumericalRestrictorsWithOverride = Template.bind({});
NumericalRestrictorsWithOverride.args = {
  ...defaultProps,
  schema: {
    minimum: 10,
    exclusiveMinimum: 10,
  }
};

export const StringRestrictors = Template.bind({});
StringRestrictors.args = {
  ...defaultProps,
  schema: {
    minLength: 5,
    maxLength: 60,
    pattern: '^https://.*$',
    format: 'uri'
  }
};

export const ObjectRestrictors = Template.bind({});
ObjectRestrictors.args = {
  ...defaultProps,
  schema: {
    minProperties: 5,
    maxProperties: 60
  }
};

export const EnumWithoutExpand = Template.bind({});
EnumWithoutExpand.args = {
  ...defaultProps,
  schema: {
    type: 'string',
    enum: ['one', 'two', 'four', 'three', 'hello', 'there']
  }
};

export const HideComplexEnumValues = Template.bind({});
HideComplexEnumValues.args = {
  ...defaultProps,
  schema: {
    type: 'object',
    enum: [{ hello: 'world' }, { hello: 'there' }, { howdy: 'partner' }]
  }
};

function seq(len: number): [number, ...number[]] {
  const result: [number, ...number[]] = [0];
  for (let i = 1; i < len; i++) {
    result.push(i);
  }
  return result;
};

export const EnumWithExpand = Template.bind({});
EnumWithExpand.args = {
  ...defaultProps,
  schema: {
    type: 'number',
    enum: seq(100)
  }
};

export const ShowEnumFromArrayItems = Template.bind({});
ShowEnumFromArrayItems.args = {
  ...defaultProps,
  schema: {
    type: 'array',
    items: {
      type: 'string',
      enum: ['one', 'two', 'four', 'three', 'hello', 'there']
    }
  }
};