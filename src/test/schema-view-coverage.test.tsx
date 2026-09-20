import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../SchemaExplorer', () => ({
  SchemaExplorer: (props: any) => (
    <div data-testid="schema-explorer">
      <span data-testid="explorer-reference">{props.path[props.path.length - 1].reference}</span>
      <button onClick={() => props.onSelectValidationRange({ startLineNumber: 2 })}>
        Select validation range
      </button>
      <span data-testid="explorer-validation-results">{props.validationResults.length}</span>
    </div>
  ),
}));

jest.mock('../SideNavWithRouter', () => ({
  SideNavWithRouter: () => <nav data-testid="side-nav" />,
}));

jest.mock('../SchemaEditor', () => ({
  SchemaEditor: (props: any) => (
    <div data-testid="schema-editor">
      <span data-testid="editor-validation-range">
        {props.validationRange ? props.validationRange.startLineNumber : 'none'}
      </span>
      <button onClick={() => props.onValidate([{ message: 'invalid' }])}>Validate</button>
    </div>
  ),
}));

import { SchemaViewWR } from '../SchemaView';

const schema = {
  title: 'Root schema',
  type: 'object',
  properties: {
    name: { title: 'Name', type: 'string' },
  },
};

function view(pathname: string, currentSchema: any = schema) {
  return render(
    <SchemaViewWR
      basePathSegments={['base']}
      schema={currentSchema}
      stage="both"
      location={{ pathname, search: '', hash: '', state: undefined }}
    />
  );
}

describe('SchemaViewWR route resolution', () => {
  test('renders the root schema when the route ends at the base path', () => {
    view('/base');

    expect(screen.getByTestId('side-nav')).toBeInTheDocument();
    expect(screen.getByTestId('schema-explorer')).toBeInTheDocument();
    expect(screen.getByTestId('explorer-reference')).toHaveTextContent('#');
  });

  test('renders a valid nested internal reference', () => {
    view('/base/%23%2Fproperties%2Fname');

    expect(screen.getByTestId('explorer-reference')).toHaveTextContent('#/properties/name');
  });

  test.each([
    ['/base/not-a-reference', 'ERROR: Could not look up the schema that was requested in the URL.'],
    ['/base/%23%2Fproperties%2Fmissing', 'ERROR: Could not look up the schema that was requested in the URL.'],
  ])('shows an error for route %s', (pathname, message) => {
    view(pathname);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('shows the boolean-schema placeholder', () => {
    view('/base/%23%2Fproperties%2Fanything', {
      type: 'object',
      properties: { anything: true },
    });

    expect(screen.getByText('TODO: Implement anything or nothing schema once clicked on.'))
      .toBeInTheDocument();
  });

  test('handles validation callbacks and forwards the selected range', () => {
    view('/base');

    expect(screen.getByTestId('explorer-validation-results')).toHaveTextContent('0');
    expect(screen.getByTestId('editor-validation-range')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('Select validation range'));
    expect(screen.getByTestId('editor-validation-range')).toHaveTextContent('2');

    fireEvent.click(screen.getByText('Validate'));
    expect(screen.getByTestId('explorer-validation-results')).toHaveTextContent('1');
  });
});
