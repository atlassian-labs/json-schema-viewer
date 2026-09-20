import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../monaco-helpers', () => ({
  MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
}));

jest.mock('@atlaskit/button', () => (props: any) => (
  <button onClick={props.onClick}>{props.children}</button>
));
jest.mock('@atlaskit/icon/core/chevron-left', () => () => <span />);
jest.mock('@atlaskit/icon/core/link', () => () => <span />);
jest.mock('@atlaskit/breadcrumbs', () => ({
  __esModule: true,
  default: (props: any) => (
    <div>
      <button onClick={props.onExpand}>Expand breadcrumbs</button>
      {props.children}
    </div>
  ),
  BreadcrumbsItem: (props: any) => <span>{props.text}</span>,
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
jest.mock('../Parameter', () => ({ ParameterView: () => <span /> }));
jest.mock('../markdown', () => ({ Markdown: (props: any) => <p>{props.source}</p> }));
jest.mock('../SchemaValidator', () => ({
  SchemaValidator: (props: any) => (
    <button onClick={() => props.onSelectRange({ startLineNumber: 4 })}>
      Validator {props.results.length}
    </button>
  ),
}));
jest.mock('../code-block-with-copy', () => ({
  CodeBlockWithCopy: (props: any) => (
    <pre data-testid={`example-${props.language}`}>{props.text}</pre>
  ),
}));

import { SchemaExplorer } from '../SchemaExplorer';
import { JsonSchema1 } from '../schema';
import { IdLookup } from '../lookup';
import { PathElement } from '../route-path';

const path: PathElement[] = [{ title: 'Root', reference: '#' }];
const nestedPath: PathElement[] = [
  { title: 'Root', reference: '#' },
  { title: 'Child', reference: '#/properties/child' },
];
const schema: JsonSchema1 = {
  type: 'object',
  properties: { child: { type: 'string' } },
};

function renderExplorer(currentPath = path, currentSchema: JsonSchema1 = schema) {
  return render(
    <MemoryRouter initialEntries={['/base?url=https%3A%2F%2Fexample.test%2Fschema.json']}>
      <SchemaExplorer
        basePathSegments={['base']}
        path={currentPath}
        schema={currentSchema}
        stage="both"
        lookup={new IdLookup()}
        validationResults={[]}
        onSelectValidationRange={jest.fn()}
      />
    </MemoryRouter>
  );
}

describe('SchemaExplorer', () => {
  test('renders a helpful message when a requested path is missing', () => {
    renderExplorer([]);
    expect(
      screen.getByText(/TODO What do we do when the reference could not be found/)
    ).toBeInTheDocument();
  });

  test('renders all views, generated examples, validation count, and breadcrumb expansion', () => {
    renderExplorer(nestedPath);

    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.getByText('Example (JSON)')).toBeInTheDocument();
    expect(screen.getByTestId('example-json')).toHaveTextContent('child');
    expect(screen.getByTestId('example-yaml')).toHaveTextContent('child');
    expect(screen.getByText('Validation results (0)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Expand breadcrumbs'));
    fireEvent.click(screen.getByText('Example (YAML)'));
    fireEvent.click(screen.getByText(/Validation results/));
    expect(screen.getByText('Validator 0')).toBeInTheDocument();
  });

  test('renders an advanced explanation when an example cannot be generated', () => {
    renderExplorer(path, false as unknown as JsonSchema1);
    expect(screen.getAllByText('An example could not be generated.')).toHaveLength(2);
    fireEvent.click(screen.getAllByText('(Expand advanced view)')[0]);
    expect(
      screen.getByText(/This example could not be automatically generated/)
    ).toBeInTheDocument();
  });
});
