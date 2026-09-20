import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import { GroupSideNavLink, SideNavWithRouter } from '../SideNavWithRouter';
import { LinkPreservingSearch, NavLinkPreservingSearch } from '../search-preserving-link';

const initialEntry = '/base/current?url=https%3A%2F%2Fexample.com%2Fschema.json';

describe('SideNavWithRouter', () => {
  test('renders single links and groups, preserving the current schema URL', () => {
    const group: GroupSideNavLink = {
      title: 'Group',
      reference: '#/group',
      children: [{ title: 'Child', reference: '#/group/child' }],
    };

    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <SideNavWithRouter
          basePathSegments={['base']}
          links={[{ title: 'Single', reference: '#/single' }, group, { type: 'space' }]}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Single', hidden: true })).toHaveAttribute(
      'href',
      '/base/%23%2Fsingle?url=https%3A%2F%2Fexample.com%2Fschema.json'
    );
    expect(screen.getByRole('link', { name: 'Group', hidden: true })).toHaveAttribute(
      'href',
      '/base/%23%2Fgroup?url=https%3A%2F%2Fexample.com%2Fschema.json'
    );
    expect(screen.queryByRole('link', { name: 'Child', hidden: true })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Closed'));
    expect(screen.getByLabelText('Open')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Child', hidden: true })).toHaveAttribute(
      'href',
      '/base/%23%2Fgroup%2Fchild?url=https%3A%2F%2Fexample.com%2Fschema.json'
    );

    fireEvent.click(screen.getByLabelText('Open'));
    expect(screen.queryByRole('link', { name: 'Child', hidden: true })).not.toBeInTheDocument();
  });

  test('omits an empty group without a reference', () => {
    render(
      <MemoryRouter>
        <SideNavWithRouter
          basePathSegments={[]}
          links={[{ title: 'Empty', reference: undefined, children: [] }]}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });
});

describe('search-preserving links', () => {
  test('preserves the current search in Link and NavLink destinations', () => {
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <LinkPreservingSearch to="/destination">Link</LinkPreservingSearch>
        <NavLinkPreservingSearch to="/nav-destination">Nav link</NavLinkPreservingSearch>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute(
      'href',
      '/destination?url=https%3A%2F%2Fexample.com%2Fschema.json'
    );
    expect(screen.getByRole('link', { name: 'Nav link' })).toHaveAttribute(
      'href',
      '/nav-destination?url=https%3A%2F%2Fexample.com%2Fschema.json'
    );
  });
});
