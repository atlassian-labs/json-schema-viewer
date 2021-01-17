import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { action } from '@storybook/addon-actions';
import { JsonSchema, JsonSchema1 } from '../schema';
import { SchemaExplorer, SchemaExplorerProps } from '../SchemaExplorer';
import { SchemaReturnerLookup } from './schema-returner-lookup';
import { IdLookup, InternalLookup } from '../lookup';
import { Schema as PackageJson } from './package.json';
import { DebuggingMemoryRouter } from './DebuggingMemoryRouter';

const schemaForContext: JsonSchema = {
  type: 'object',
  properties: {
      'responseOnly': {
          description: 'This should only show up if readOnly is true',
          type: 'string',
          readOnly: true
      },
      'both': {
          description: 'This should show up in both examples',
          type: 'string'
      },
      'requestOnly': {
          description: 'This should only show up if writeOnly is true.',
          type: 'string',
          writeOnly: true
      }
  }
};

export default {
   title: 'JsonSchema/SchemaExplorer',
   component: SchemaExplorer,
   argTypes: {
   },
} as Meta;

const Template: Story<SchemaExplorerProps> = (args) => <DebuggingMemoryRouter><SchemaExplorer {...args} /></DebuggingMemoryRouter>;

const defaultArgs: Partial<SchemaExplorerProps> = {
   basePathSegments: ['base'],
   path: [{ title: 'object', reference: '#' }],
   lookup: new IdLookup(),
   stage: 'both'
};

export const DefaultView = Template.bind({});
(() => {
   const userRef: JsonSchema1 = {
      '$ref': '#/components/schemas/User'
  };
  const detailsRef: JsonSchema1 = {
      '$ref': '#/components/schemas/UserDetails'
  };
  const userSchema: JsonSchema = {
      title: 'User',
      description: 'A Confluence User, that everybody wants to see.',
      type: 'object',
      required: [
        'type',
        'username',
        'userKey',
        'accountId',
        'profilePicture',
        'displayName',
        '_expandable',
        '_links'
      ],
      additionalProperties: false,
      properties: {
        type: {
          type: 'string',
          'enum': [
            'known',
            'unknown',
            'anonymous',
            'user'
          ]
        },
        username: {
          type: 'string',
          description: 'The name of the user.'
        },
        userKey: {
          type: 'string'
        },
        accountId: {
          type: 'string'
        },
        profilePicture: {
          $ref: '#/components/schemas/Icon'
        },
        displayName: {
          type: 'string'
        },
        operations: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/OperationCheckResult'
          }
        },
        details: detailsRef,
        _expandable: {
          type: 'object',
          additionalProperties: false,
          properties: {
            operations: {
              type: 'string'
            },
            details: {
              type: 'string'
            }
          }
        },
        _links: {
          $ref: '#/components/schemas/GenericLinks'
        }
      }
    };

  const userDetailsSchema: JsonSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        business: {
          type: 'object',
          required: [
            'position',
            'department',
            'location'
          ],
          additionalProperties: false,
          properties: {
            position: {
              type: 'string'
            },
            department: {
              type: 'string'
            },
            location: {
              type: 'string'
            }
          }
        },
        personal: {
          type: 'object',
          required: [
            'phone',
            'im',
            'website',
            'email'
          ],
          additionalProperties: false,
          properties: {
            phone: {
              type: 'string'
            },
            im: {
              type: 'string'
            },
            website: {
              type: 'string'
            },
            email: {
              type: 'string'
            }
          }
        }
      }
    };

  const lookup = new SchemaReturnerLookup({
      [`${userRef.$ref}`]: userSchema,
      [`${detailsRef.$ref}`]: userDetailsSchema,
      [`${userRef.$ref}/properties/details`]: userDetailsSchema
  });

  DefaultView.args = {
     ...defaultArgs,
     path: [{
        title: userSchema.title || 'object',
        reference: userRef.$ref || ''
     }],
     lookup,
     schema: userSchema,
     stage: 'both'
  }
})();

export const PackageJsonRoot = Template.bind({});
PackageJsonRoot.storyName = 'package.json (root)';
PackageJsonRoot.args = {
   ...defaultArgs,
   lookup: new InternalLookup(PackageJson),
   schema: PackageJson,
   stage: 'both'
};

export const BothContext = Template.bind({});
BothContext.args = {
   ...defaultArgs,
   lookup: new InternalLookup(schemaForContext),
   schema: schemaForContext,
   stage: 'both'
};

export const WriteContext = Template.bind({});
WriteContext.args = {
   ...defaultArgs,
   lookup: new InternalLookup(schemaForContext),
   schema: schemaForContext,
   stage: 'write'
};

export const ReadContext = Template.bind({});
ReadContext.args = {
   ...defaultArgs,
   lookup: new InternalLookup(schemaForContext),
   schema: schemaForContext,
   stage: 'read'
};

export const AdditionalPropertiesIsTrue = Template.bind({});
AdditionalPropertiesIsTrue.storyName = 'Additional properties (true)';
AdditionalPropertiesIsTrue.args = {
   ...defaultArgs,
   schema: { additionalProperties: true },
};

export const AdditionalPropertiesPrimitive = Template.bind({});
AdditionalPropertiesPrimitive.storyName = 'Additional properties (primitive)';
AdditionalPropertiesPrimitive.args = {
   ...defaultArgs,
   schema: { additionalProperties: { type: 'number' } }
};

export const AdditionalPropertiesComplex = Template.bind({});
AdditionalPropertiesComplex.storyName = 'Additional properties (complex)';
AdditionalPropertiesComplex.args = {
   ...defaultArgs,
   schema: {
      additionalProperties: {
         type: 'array',
         items: {
             anyOf: [
                 { type: 'string' },
                 { type: 'boolean' }
             ]
         }
     }
   }
};

export const AdditionalPropertiesClickable = Template.bind({});
AdditionalPropertiesClickable.storyName = 'Additional properties (clickable)';
AdditionalPropertiesClickable.args = {
   ...defaultArgs,
   schema: {
      additionalProperties: {
         type: 'object',
         title: 'PropName',
         properties: {
           one: { type: 'string' },
           two: { type: 'number' }
         }
       }
   }
};

export const SingletonAllOf = Template.bind({});
SingletonAllOf.storyName = 'Singleton allOf';
(() => {
   const componentSchema: JsonSchema = {
      'type': 'object',
      'properties': {
        'lead': {
          'type': 'object',
          'description': "The user details for the component's lead user.",
          'readOnly': true,
          'allOf': [
            {
              '$ref': '#/components/schemas/User'
            }
          ]
        }
      }
    };

    const userSchema: JsonSchema = {
      'type': 'object',
      'properties': {
        'self': {
          'type': 'string',
          'format': 'uri',
          'description': 'The URL of the user.',
          'readOnly': true
        },
        'key': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'This property has been deprecated in favour of `accountId` due to privacy changes. See the [migration guide](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.  \nThe key of the user. In requests, required unless `accountId` or `key` is specified.'
        },
        'accountId': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'The accountId of the user, which uniquely identifies the user across all Atlassian products. For example, _384093:32b4d9w0-f6a5-3535-11a3-9c8c88d10192_. In requests, required unless `name` or `key` is specified.'
        },
        'name': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'This property has been deprecated in favour of `accountId` due to privacy changes. See the [migration guide](https://developer.atlassian.com/cloud/jira/platform/deprecation-notice-user-privacy-api-migration-guide/) for details.  \nThe username of the user. In requests, required unless `accountId` or `name` is specified.'
        },
        'emailAddress': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'The email address of the user. Depending on the user’s privacy setting, this may be returned as null.',
          'readOnly': true
        },
        'displayName': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'The display name of the user. Depending on the user’s privacy setting, this may return an alternative value.',
          'readOnly': true
        },
        'active': {
          'type': 'boolean',
          'description': 'Indicates whether the user is active.',
          'readOnly': true
        },
        'timeZone': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': "The time zone specified in the user's profile. Depending on the user’s privacy setting, this may be returned as null.",
          'readOnly': true
        },
        'locale': {
          'type': 'string',
          // tslint:disable-next-line:max-line-length
          'description': 'The locale of the user. Depending on the user’s privacy setting, this may be returned as null.',
          'readOnly': true
        },
        'expand': {
          'type': 'string',
          'xml': {
            'attribute': true
          },
          'description': 'Details of expands available for the user details.',
          'readOnly': true
        }
      },
      'xml': {
        'name': 'user'
      },
      'description': 'A user.'
    };

    const lookup = new SchemaReturnerLookup({
      '#/components/schemas/User': userSchema
    });

    SingletonAllOf.args = {
      ...defaultArgs,
      lookup,
      stage: 'read',
      schema: componentSchema
   };
})();