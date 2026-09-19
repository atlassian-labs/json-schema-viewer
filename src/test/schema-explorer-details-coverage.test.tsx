import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../monaco-helpers', () => ({
  MarkerSeverity: { Error: 8, Warning: 4, Info: 2, Hint: 1 },
}));

import { SchemaExplorerDetails } from '../SchemaExplorer';
import { JsonSchema1 } from '../schema';
import { ClickElement } from '../Type';
import { IdLookup, InternalLookup, Lookup } from '../lookup';

const clickElement: ClickElement = ({ fallbackTitle, reference }) => (
  <a href={reference} data-testid={`link-${reference}`}>
    {fallbackTitle}
  </a>
);

function renderDetails(schema: JsonSchema1, options: { lookup?: Lookup; stage?: 'read' | 'write' | 'both' } = {}) {
  return render(
    <MemoryRouter initialEntries={['/view/%23']}>
      <SchemaExplorerDetails
        schema={schema}
        reference="#"
        lookup={options.lookup || new IdLookup()}
        stage={options.stage || 'both'}
        clickElement={clickElement}
      />
    </MemoryRouter>,
  );
}

describe('SchemaExplorerDetails', () => {
  test('renders descriptions, required properties, pattern properties, and allowed additional properties', () => {
    renderDetails({
      description: 'A **useful** object.',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'The display name.' },
        count: { type: 'integer' },
      },
      patternProperties: {
        '^x-': { type: 'string' },
      },
      additionalProperties: true,
    });

    expect(screen.getAllByText('useful')).toHaveLength(2);
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('The display name.')).toBeInTheDocument();
    expect(screen.getByText('count')).toBeInTheDocument();
    expect(screen.getByText('/^x-/ (keys of pattern)')).toBeInTheDocument();
    expect(screen.getByText('Additional Properties')).toBeInTheDocument();
    expect(screen.getByText('Extra properties of any type may be provided to this object.'))
      .toBeInTheDocument();
  });

  test('filters read-only and write-only properties according to the selected stage', () => {
    const schema: JsonSchema1 = {
      properties: {
        always: { type: 'string' },
        onlyWhenReading: { type: 'string', readOnly: true },
        onlyWhenWriting: { type: 'string', writeOnly: true },
      },
    };

    const { rerender } = renderDetails(schema, { stage: 'read' });
    expect(screen.getByText('always')).toBeInTheDocument();
    expect(screen.getByText('onlyWhenReading')).toBeInTheDocument();
    expect(screen.queryByText('onlyWhenWriting')).not.toBeInTheDocument();

    rerender(
      <MemoryRouter initialEntries={['/view/%23']}>
        <SchemaExplorerDetails
          schema={schema}
          reference="#"
          lookup={new IdLookup()}
          stage="write"
          clickElement={clickElement}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('always')).toBeInTheDocument();
    expect(screen.queryByText('onlyWhenReading')).not.toBeInTheDocument();
    expect(screen.getByText('onlyWhenWriting')).toBeInTheDocument();
  });

  test('renders composite schemas under a Mixins heading', () => {
    renderDetails({
      allOf: [{ type: 'string' }, { type: 'number' }],
    });

    expect(screen.getByText('Mixins')).toBeInTheDocument();
    expect(screen.getByText(/This object must match the following conditions/)).toBeInTheDocument();
    expect(screen.getByText(/allOf/)).toBeInTheDocument();
  });

  test('passes resolved internal and unresolved external references to clickable elements', () => {
    const schema: JsonSchema1 = {
      definitions: {
        Child: { title: 'Child object', type: 'object', properties: { id: { type: 'string' } } },
      },
      properties: {
        child: { $ref: '#/definitions/Child' },
        remote: { $ref: 'http://example.test/other.json#/Thing' },
      },
    };

    renderDetails(schema, { lookup: new InternalLookup(schema) });

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(screen.getByTestId('link-#/definitions/Child')).toHaveTextContent('Child object');
    expect(screen.getByText('remote')).toBeInTheDocument();
    expect(screen.getByTestId('link-#/properties/remote')).toHaveTextContent('anything');
  });
});
