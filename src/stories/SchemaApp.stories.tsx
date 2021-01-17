import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { SchemaView, SchemaViewProps } from '../SchemaView';
import { Schema as PackageJson } from './package.json';
import { Schema as OpenAPISchema } from './openapi.json';
import { DebuggingMemoryRouter } from './DebuggingMemoryRouter';
import { SchemaApp, SchemaAppProps } from '../SchemaApp';

export default {
   title: 'JsonSchema/SchemaApp',
   component: SchemaApp,
   argTypes: {
   },
} as Meta;

const Template: Story<SchemaAppProps> = (args) => (
   <DebuggingMemoryRouter initialEntries={['/']}>
      <SchemaApp {...args} />
   </DebuggingMemoryRouter>
);

export const PackageJsonStory = Template.bind({});
PackageJsonStory.storyName = 'package.json';
PackageJsonStory.args = {};