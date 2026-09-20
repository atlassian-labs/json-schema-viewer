import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@atlaskit/button', () => (props: any) => (
  <button onClick={props.onClick} data-href={props.href}>
    {props.children}
  </button>
));
jest.mock('@atlaskit/icon/core/chevron-left', () => () => <span />);
jest.mock('@atlaskit/icon/core/link', () => () => <span />);
jest.mock('@atlaskit/breadcrumbs', () => ({
  __esModule: true,
  default: (props: any) => <div>{props.children}</div>,
  BreadcrumbsItem: (props: any) => <div>{props.component ? props.component() : props.text}</div>,
}));
jest.mock('@atlaskit/tabs', () => {
  const React = require('react');
  const TabsContext = React.createContext((_: number) => undefined);
  const Tab = (props: any) => {
    const onChange = React.useContext(TabsContext);
    return <button onClick={() => onChange(props.index)}>{props.children}</button>;
  };
  const TabList = (props: any) => <div>{props.children}</div>;
  const TabPanel = (props: any) => <section>{props.children}</section>;
  const Tabs = (props: any) => {
    const tabs = React.Children.toArray(props.children)[0].props.children;
    return (
      <TabsContext.Provider value={props.onChange}>
        <div>
          {React.Children.map(tabs, (tab: any, index: number) => React.cloneElement(tab, { index }))}
          {React.Children.toArray(props.children).slice(1)}
        </div>
      </TabsContext.Provider>
    );
  };
  return { __esModule: true, default: Tabs, Tab, TabList, TabPanel };
});
jest.mock('../search-preserving-link', () => ({
  LinkPreservingSearch: (props: any) =>
    props.component ? (
      require('react').createElement(props.component, { href: props.to })
    ) : (
      <a href={props.to}>{props.children}</a>
    ),
  NavLinkPreservingSearch: (props: any) => <a href={props.to}>{props.children}</a>,
}));
jest.mock('../monaco-helpers', () => ({
  MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
}));
jest.mock('../SchemaValidator', () => ({ SchemaValidator: () => <span /> }));
jest.mock('../code-block-with-copy', () => ({ CodeBlockWithCopy: () => <span /> }));
jest.mock('../markdown', () => ({ Markdown: (props: any) => <p>{props.source}</p> }));
jest.mock('../Type', () => ({
  Anything: () => <span>anything</span>,
  Type: () => <span />,
}));
jest.mock('../Parameter', () => ({
  ParameterView: (props: any) => (
    <section>
      <strong>{props.name}</strong>
      {props.description && <span>{props.description}</span>}
      {props.clickElement &&
        props.schema !== undefined &&
        require('react').createElement(props.clickElement, {
          fallbackTitle: 'fallback',
          schema: props.schema,
          reference: props.reference,
        })}
    </section>
  ),
}));

import { SchemaExplorer, SchemaExplorerDetails } from '../SchemaExplorer';
import { JsonSchema1 } from '../schema';
import { IdLookup, InternalLookup, Lookup } from '../lookup';
import { PathElement } from '../route-path';

const clickElement = ({ fallbackTitle, reference }: any) => (
  <span>
    {fallbackTitle}:{reference}
  </span>
);
const rootPath: PathElement[] = [{ title: 'Root', reference: '#' }];
const nestedPath: PathElement[] = [
  { title: 'Root', reference: '#' },
  { title: 'Child', reference: '#/properties/child' },
];

describe('SchemaExplorer branch coverage', () => {
  test('renders breadcrumb links and invokes the back button', () => {
    render(
      <MemoryRouter initialEntries={['/base/child?url=https%3A%2F%2Fexample.test%2Fschema.json']}>
        <SchemaExplorer
          basePathSegments={['base']}
          path={nestedPath}
          schema={{ type: 'object', properties: { child: { type: 'string' } } }}
          stage="both"
          lookup={new IdLookup()}
          validationResults={[]}
          onSelectValidationRange={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  test('describes boolean and empty schemas and resolves additional properties', () => {
    const schema: JsonSchema1 = {
      properties: {
        allowed: true,
        denied: false,
        unconstrained: {},
      },
      additionalProperties: { $ref: '#/definitions/Extra' },
      definitions: { Extra: { type: 'number' } },
    };
    render(
      <MemoryRouter>
        <SchemaExplorerDetails
          schema={schema}
          reference="#"
          lookup={new InternalLookup(schema)}
          stage="both"
          clickElement={clickElement}
        />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Anything is allowed here.')).toHaveLength(2);
    expect(screen.getByText('There is no valid value for this property.')).toBeInTheDocument();
    expect(screen.getByText('Additional Properties')).toBeInTheDocument();
  });

  test('renders an external reference link and an invalid reference as anything', () => {
    const schema: JsonSchema1 = {
      properties: {
        validRemote: { $ref: 'http://example.test/schema.json#/Thing' },
        invalidRemote: { $ref: 'http://[invalid' },
      },
    };
    render(
      <MemoryRouter>
        <SchemaExplorer
          basePathSegments={['view']}
          path={rootPath}
          schema={schema}
          stage="both"
          lookup={new IdLookup()}
          validationResults={[]}
          onSelectValidationRange={jest.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('$ref: http://example.test/schema.json#/Thing')).toBeInTheDocument();
    expect(screen.getByText('anything')).toBeInTheDocument();
  });
});
