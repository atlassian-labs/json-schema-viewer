import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { DebuggingMemoryRouter } from './DebuggingMemoryRouter';
import { SchemaApp } from '../SchemaApp';

export default {
   title: 'JsonSchema/SchemaApp',
   component: SchemaApp,
   argTypes: {
   },
} as Meta;

const Template: StoryFn<{}> = () => (
   <DebuggingMemoryRouter initialEntries={['/']}>
      <SchemaApp />
   </DebuggingMemoryRouter>
);

export const RootPage = Template.bind({});
RootPage.storyName = 'Default view';
RootPage.args = {};
