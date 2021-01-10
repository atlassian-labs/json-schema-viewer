import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { IdLookup } from '../lookup';
import { Type, TypeProps } from '../Type';
import { SchemaArray, SimpleTypes } from '../schema';

export default {
  title: 'JsonSchema/Type',
  component: Type,
  argTypes: {
  },
} as Meta;

const noOp = () => {
  // NoOp
};

const defaultProps = {
  lookup: new IdLookup(),
  onTypeClick: noOp
};

const Template: Story<TypeProps> = (args) => <Type {...args} />;

export const EmptySchema = Template.bind({});
EmptySchema.args = {
  ...defaultProps,
  s: {}
};

export const PrimitiveBoolean = Template.bind({});
PrimitiveBoolean.args = {
  ...defaultProps,
  s: { type: 'boolean' }
};

export const PrimitiveNull = Template.bind({});
PrimitiveNull.args = {
  ...defaultProps,
  s: { type: 'null' }
};

export const PrimitiveNumber = Template.bind({});
PrimitiveNumber.args = {
  ...defaultProps,
  s: { type: 'number' }
};

export const PrimitiveInteger = Template.bind({});
PrimitiveInteger.args = {
  ...defaultProps,
  s: { type: 'integer' }
};

export const PrimitiveString = Template.bind({});
PrimitiveString.args = {
  ...defaultProps,
  s: { type: 'string' }
};

export const ArrayOfAnythingType1 = Template.bind({});
ArrayOfAnythingType1.args = {
  ...defaultProps,
  s: { type: 'array', items: {} }
};

export const ArrayOfAnythingType2 = Template.bind({});
ArrayOfAnythingType2.args = {
  ...defaultProps,
  s: { type: 'array', items: true }
};

export const ArrayOfAnythingType3 = Template.bind({});
ArrayOfAnythingType3.args = {
  ...defaultProps,
  s: { type: 'array' }
};

export const ArrayOfNothing = Template.bind({});
ArrayOfNothing.args = {
  ...defaultProps,
  s: { type: 'array', items: false }
};

export const ArrayOfInteger = Template.bind({});
ArrayOfInteger.args = {
  ...defaultProps,
  s: { type: 'array', items: { type: 'integer' } }
};

export const NestedArrays = Template.bind({});
NestedArrays.args = {
  ...defaultProps,
  s: {
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    }
  }
};

export const AnonymousObject = Template.bind({});
AnonymousObject.args = {
  ...defaultProps,
  s: { type: 'object' }
};

export const NamedObject = Template.bind({});
NamedObject.args = {
  ...defaultProps,
  s: {
    title: 'MySpecialNamedType',
    type: 'object',
  }
};

export const AnyOf = Template.bind({});
AnyOf.args = {
  ...defaultProps,
  s: {
    anyOf: [
      { type: 'string' },
      { type: 'integer' }
    ]
  }
};

export const AnyOfSingleton = Template.bind({});
AnyOfSingleton.args = {
  ...defaultProps,
  s: {
    anyOf: [
      { type: 'string' }
    ]
  }
};

export const ZeroLengthAnyOf = Template.bind({});
ZeroLengthAnyOf.args = {
  ...defaultProps,
  s: {
    type: 'object',
    anyOf: ([] as unknown) as SchemaArray,
    additionalProperties: false
  }
};

export const OneOf = Template.bind({});
OneOf.args = {
  ...defaultProps,
  s: {
    oneOf: [
      { type: 'string' },
      { type: 'integer' }
    ]
  }
};

export const OneOfSingleton = Template.bind({});
OneOfSingleton.args = {
  ...defaultProps,
  s: {
    oneOf: [
      { type: 'string' }
    ]
  }
};

export const ZeroLengthOneOf = Template.bind({});
ZeroLengthOneOf.args = {
  ...defaultProps,
  s: {
    type: 'object',
    oneOf: ([] as unknown) as SchemaArray,
    additionalProperties: false
  }
};

export const AllOf = Template.bind({});
AllOf.args = {
  ...defaultProps,
  s: {
    allOf: [
      { type: 'string' },
      { type: 'integer' }
    ]
  }
};

export const AllOfSingleton = Template.bind({});
AllOfSingleton.args = {
  ...defaultProps,
  s: {
    allOf: [
      { type: 'string' }
    ]
  }
};

export const ZeroLengthAllOf = Template.bind({});
ZeroLengthAllOf.args = {
  ...defaultProps,
  s: {
    type: 'object',
    allOf: ([] as unknown) as SchemaArray,
    additionalProperties: false
  }
};

export const PrimitiveNot = Template.bind({});
PrimitiveNot.args = {
  ...defaultProps,
  s: {
    not: {
      type: 'boolean'
    }
  }
};

export const NotOnPrimitiveArray = Template.bind({});
NotOnPrimitiveArray.args = {
  ...defaultProps,
  s: {
    not: {
      type: 'array',
      items: {
        type: 'boolean'
      }
    }
  }
};

export const SimpleObjectNot = Template.bind({});
SimpleObjectNot.args = {
  ...defaultProps,
  s: {
    not: {
      type: 'object',
      properties: {
        a: { type: 'string' }
      }
    }
  }
};

export const NotAllOf = Template.bind({});
NotAllOf.args = {
  ...defaultProps,
  s: {
    not: {
      allOf: [
        {
          title: 'One',
          type: 'object',
          properties: {
            a: { type: 'string' }
          }
        },
        {
          title: 'Two',
          type: 'object',
          properties: {
            b: { type: 'integer' }
          }
        }
      ]
    }
  }
};

export const AllOfAndAnyOfConjunction = Template.bind({});
AllOfAndAnyOfConjunction.args = {
  ...defaultProps,
  s: {
    anyOf: [
      {
        type: 'array',
        items: {
          type: 'string'
        }
      },
      {
        type: 'array',
        items: {
          type: 'integer'
        }
      }
    ],
    allOf: [
      { minItems: 0 },
      { maxItems: 10 }
    ]
  }
};

export const MultipleComplexJoins = Template.bind({});
MultipleComplexJoins.args = {
  ...defaultProps,
  s: {
    allOf: [
      {
        title: 'One',
        oneOf: [
          { type: 'integer' },
          { type: 'boolean' }
        ]
      },
      {
        title: 'Two',
        not: {
          anyOf: [
            {
              title: 'NotThis',
              type: 'object',
            },
            {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          ]
        }
      }
    ]
  }
};

export const MultipleCompositeCommands = Template.bind({});
MultipleCompositeCommands.args = {
  ...defaultProps,
  s: {
    allOf: [
      { type: 'array', items: {} },
      { type: 'object' }
    ], oneOf: [
      { type: 'object' },
      { type: 'array', items: { type: 'string' } }
    ], not: {
      type: 'number'
    }, anyOf: [
      { type: 'object', properties: { a: { type: 'string' } } },
      { type: 'object', properties: { a: { type: 'number' } } }
    ]
  }
};

export const ArrayComposite = Template.bind({});
ArrayComposite.args = {
  ...defaultProps,
  s: {
    type: 'array',
    anyOf: [
      { type: 'array', items: { type: 'number' }},
      { type: 'array', items: { type: 'string' }}
    ]
  }
};

export const MultiplePrimitiveTypes = Template.bind({});
MultiplePrimitiveTypes.args = {
  ...defaultProps,
  s: {
    type: ['string', 'number', 'null']
  }
};

export const MultiplePrimitiveTypesWithNamedObject = Template.bind({});
MultiplePrimitiveTypesWithNamedObject.args = {
  ...defaultProps,
  s: {
    type: ['object', 'number', 'null'],
    title: 'NamedObject'
  }
};

export const TypesArrayWithSingleton = Template.bind({});
TypesArrayWithSingleton.args = {
  ...defaultProps,
  s: {
    type: ['null'],
  }
};

export const EmptyTypesArray = Template.bind({});
EmptyTypesArray.args = {
  ...defaultProps,
  s: {
    type: ([] as unknown) as SimpleTypes
  }
};

export const ArrayItemsOfDifferentTypes = Template.bind({});
ArrayItemsOfDifferentTypes.args = {
  ...defaultProps,
  s: {
    type: 'array',
    items: [
      { type: 'string' },
      { type: 'number' }
    ]
  }
};

export const ArrayItemsSingleton = Template.bind({});
ArrayItemsSingleton.args = {
  ...defaultProps,
  s: {
    type: 'array',
    items: [
      { type: 'string' }
    ]
  }
};

export const ArrayItemsEmptyArray = Template.bind({});
ArrayItemsEmptyArray.args = {
  ...defaultProps,
  s: {
    type: 'array',
    items: ([] as unknown) as SchemaArray
  }
};