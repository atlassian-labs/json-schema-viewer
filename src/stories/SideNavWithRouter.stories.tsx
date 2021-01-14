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
  <DebuggingMemoryRouter initialEntries={['/']}>
    <SideNavWithRouter {...args} />
  </DebuggingMemoryRouter>
);

export const NoLinks = Template.bind({});
NoLinks.args = {
  basePath: '/base',
  links: []
};

export const SinglesExample = Template.bind({});
SinglesExample.args = {
  basePath: '/base',
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
  basePath: '/base',
  links: createGroups(3, 3)
};

export const SingleAndGroupExample = Template.bind({});
SingleAndGroupExample.args = {
  basePath: '/base',
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
/*
import React from 'react';
import { Swagger, urlGroupingStrategy, tagGroupingStrategy } from 'atlassian-openapi';
import { PartialStoriesOf } from '../../types/storybook';
import { SideNavWithRouter } from '../SideNavWithRouter';
import { ConfluenceSchema } from './confluence';
import { PetStore } from './petstore';
import { DebuggingMemoryRouter } from '../DebuggingMemoryRouter';

const fakeNarrative: Swagger.NarrativeDocument[] = [
  {
    title: 'First topic',
    anchor: 'first',
    body: 'This is first.'
  },
  {
    title: 'Second topic',
    anchor: 'second',
    body: 'This is second.'
  },
  {
    title: 'Third topic',
    anchor: 'third',
    body: 'This is third.'
  }
];

const defaultProps = {
  basePath: '/',
  swaggerUrl: '../swagger.v3.json',
  narrative: []
};

export default function loadStories(storyFactory: PartialStoriesOf) {
  storyFactory('SideNav')
    .add('URL Grouping Without Summary', () => {
      const g = urlGroupingStrategy({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test/path': {
            get: {
              responses: {}
            },
            put: {
              responses: {}
            }
          }
        }
      });
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('URL Grouping with Summary', () => {
      const g = urlGroupingStrategy({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test/path': {
            summary: 'Test path',
            get: {
              responses: {}
            },
            put: {
              responses: {}
            }
          }
        }
      });
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('All nice summaries', () => {
      const g = urlGroupingStrategy({
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0.0' },
        paths: {
          '/test/path': {
            summary: 'Test path',
            get: {
              summary: 'Test get',
              responses: {}
            },
            put: {
              summary: 'Test put',
              responses: {}
            }
          }
        }
      });
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('Confluence SideNavWithRouter - URL', () => {
      const g = urlGroupingStrategy(ConfluenceSchema);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('Confluence SideNavWithRouter - Tag', () => {
      const g = tagGroupingStrategy(ConfluenceSchema);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('PetStore SideNavWithRouter - URL', () => {
      const g = urlGroupingStrategy(PetStore);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('PetStore SideNavWithRouter - Tag', () => {
      const g = tagGroupingStrategy(PetStore);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter ogs={g} {...defaultProps} />
        </DebuggingMemoryRouter>
      );
    })
    .add('PetStore with Narrative', () => {
      const g = tagGroupingStrategy(PetStore);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter basePath="/" ogs={g} narrative={fakeNarrative} />
        </DebuggingMemoryRouter>);
    })
    .add('SSR Example', () => {
      const g = tagGroupingStrategy(PetStore);
      return (
        <DebuggingMemoryRouter initialEntries={['/']}>
          <SideNavWithRouter basePath="/" ogs={g} narrative={fakeNarrative} isSSR={true} />
        </DebuggingMemoryRouter>);
    });
}
*/