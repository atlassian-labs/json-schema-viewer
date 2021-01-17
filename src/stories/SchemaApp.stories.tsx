import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { DebuggingMemoryRouter } from './DebuggingMemoryRouter';
import { SchemaApp } from '../SchemaApp';

export default {
   title: 'JsonSchema/SchemaApp',
   component: SchemaApp,
   argTypes: {
   },
} as Meta;

const Template: Story<{}> = () => (
   <DebuggingMemoryRouter initialEntries={['/']}>
      <SchemaApp />
   </DebuggingMemoryRouter>
);

export const RootPage = Template.bind({});
RootPage.storyName = 'Default view';
RootPage.args = {};