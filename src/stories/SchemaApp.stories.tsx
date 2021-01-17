import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
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

export const RootPage = Template.bind({});
RootPage.storyName = 'Default view';
RootPage.args = {};