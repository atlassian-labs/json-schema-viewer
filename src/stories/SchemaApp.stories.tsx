import React from 'react';
import { Story, Meta } from '@storybook/react';
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
