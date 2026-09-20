import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@atlaskit/atlassian-navigation', () => ({
  AtlassianNavigation: (props: any) => (
    <div data-testid="navigation">
      {props.renderProductHome()}
      {props.primaryItems}
      {props.renderCreate()}
    </div>
  ),
  Create: (props: any) => <button onClick={props.onClick}>{props.text}</button>,
  ProductHome: (props: any) => <div data-testid="product-home">{props.siteTitle}</div>,
}));

jest.mock('@atlaskit/logo', () => ({ AtlassianIcon: () => null, AtlassianLogo: () => null }));

jest.mock('@atlaskit/menu', () => ({
  PopupMenuGroup: (props: any) => <div>{props.children}</div>,
  Section: (props: any) => <section aria-label={props.title}>{props.children}</section>,
  ButtonItem: (props: any) => <button onClick={props.onClick}>{props.children}</button>,
  LinkItem: (props: any) => (
    <a href={props.href} target={props.target} rel={props.rel} onClick={props.onClick}>
      {props.children}
    </a>
  ),
}));

jest.mock('../PrimaryDropdown', () => ({
  PrimaryDropdown: (props: any) => (
    <div data-testid={`dropdown-${props.text}`}>
      <span>{props.text}</span>
      {props.content({ closePopup: jest.fn() })}
    </div>
  ),
}));

jest.mock('../Start', () => ({ Start: () => <div data-testid="start">Start page</div> }));
jest.mock('../Docs', () => ({ Docs: () => <div data-testid="docs">Docs page</div> }));
jest.mock('../SchemaView', () => ({ SchemaView: (props: any) => <div data-testid="schema-view">{props.stage}</div> }));
jest.mock('../LoadSchema', () => ({
  LoadSchema: (props: any) => props.children({ type: 'object', title: 'Loaded' }),
}));

import { SchemaApp } from '../SchemaApp';

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <SchemaApp />
    </MemoryRouter>
  );

describe('SchemaApp', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('redirects the root route to the start page and renders navigation', () => {
    renderApp('/');

    expect(screen.getByTestId('product-home')).toHaveTextContent('JSON Schema Viewer');
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load new schema' })).not.toBeInTheDocument();
  });

  test('renders loaded schemas and documentation routes', () => {
    const loaded = renderApp('/view/example?url=https%3A%2F%2Fexample.com%2Fschema.json');
    expect(screen.getByTestId('schema-view')).toHaveTextContent('both');
    loaded.unmount();

    renderApp('/docs/usage');
    expect(screen.getByTestId('docs')).toBeInTheDocument();
  });

  test('loads the start page from the create navigation action', () => {
    renderApp('/docs/usage');

    fireEvent.click(screen.getByRole('button', { name: 'Load new schema' }));
    expect(screen.getByTestId('start')).toBeInTheDocument();
  });

  test('renders example and repository links and closes an example link', () => {
    renderApp('/start');

    expect(screen.getByRole('link', { name: 'Atlassian Forge' })).toHaveAttribute(
      'href',
      '/view/%23?url=https%3A%2F%2Funpkg.com%2F%40forge%2Fmanifest%40latest%2Fout%2Fschema%2Fmanifest-schema.json'
    );
    expect(screen.getByRole('link', { name: 'Schemastore Repository' })).toHaveAttribute(
      'target',
      '_blank'
    );
    fireEvent.click(screen.getByRole('link', { name: 'Atlassian Forge' }));
  });

  test('renders help links and navigates internal documentation', () => {
    renderApp('/start');

    fireEvent.click(screen.getByRole('link', { name: 'Introduction' }));
    expect(screen.getByTestId('docs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Linking your schema' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Understanding JSON Schema' })).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  test('renders recently viewed links when local storage has entries', () => {
    window.localStorage.setItem(
      'recently-viewed.v1',
      JSON.stringify({ links: [{ title: 'Previous schema', url: 'https://example.com/previous.json' }] })
    );
    renderApp('/start');

    expect(screen.getByRole('link', { name: 'Previous schema' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Previous schema' }));
  });
});
