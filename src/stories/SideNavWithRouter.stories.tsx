import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { action } from '@storybook/addon-actions';
import { SideNavWithRouter, SideNavWithRouterProps, GroupSideNavLink, SingleSideNavLink, SideNavLink } from '../SideNavWithRouter';
import { DebuggingMemoryRouter } from './DebuggingMemoryRouter';

export default {
  title: 'JsonSchema/SideNav',
  component: SideNavWithRouter,
  argTypes: {
  },
} as Meta;

const Template: Story<SideNavWithRouterProps> = (args) => (
  <DebuggingMemoryRouter initialEntries={['base']}>
    <SideNavWithRouter {...args} />
  </DebuggingMemoryRouter>
);

export const NoLinks = Template.bind({});
NoLinks.args = {
  basePathSegments: ['base'],
  links: []
};

export const SinglesExample = Template.bind({});
SinglesExample.args = {
  basePathSegments: ['base'],
  links: [{
    title: 'One',
    reference: '#/definitions/one'
  }, {
    title: 'Two',
    reference: '#/definitions/two'
  }, {
    title: 'Three',
    reference: '#/definitions/three'
  }]
};

function createGroup(title: string, reference: string, childCount: number): GroupSideNavLink {
  const children = Array.from(Array(childCount).keys()).map<SingleSideNavLink>  (n => ({
    title: `Item ${n}`,
    reference: `${reference}/item-${n}`
  }));

  return {
    title,
    reference,
    children
  };
}

function createGroups(groupCount: number, childCount: number): SideNavLink[] {
  return Array.from(Array(groupCount).keys()).map<SideNavLink>(n => createGroup(`Group ${n}`, `#/group-${n}`, childCount));
}

export const GroupsExample = Template.bind({});
GroupsExample.args = {
  basePathSegments: ['base'],
  links: createGroups(3, 3)
};

export const SingleAndGroupExample = Template.bind({});
SingleAndGroupExample.args = {
  basePathSegments: ['base'],
  links: [{
    title: 'One',
    reference: '#/one'
  }, ...createGroups(1, 4),
  {
    title: 'Two',
    reference: '#/two'
  }, ...createGroups(3, 3), {
    title: 'Three',
    reference: '#/three'
  }]
};