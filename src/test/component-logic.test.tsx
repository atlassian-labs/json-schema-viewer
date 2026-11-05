import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ExpandibleList } from '../ExpandibleList';
import { IdLookup } from '../lookup';
import { ParameterMetadata } from '../ParameterMetadata';

describe('ExpandibleList', () => {
  const elements = [{ element: 'one' }, { element: 'two' }, { element: 'three' }];

  test('renders every item when the list fits within the collapsed length', () => {
    render(<ExpandibleList elements={elements} collapsedMaxLength={3} />);

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(screen.queryByText('(Show more)')).not.toBeInTheDocument();
  });

  test('expands and collapses long lists through the user-visible links', () => {
    const longElements = Array.from({ length: 4 }, (_, index) => ({
      element: `item-${index + 1}`,
    }));
    render(<ExpandibleList elements={longElements} collapsedMaxLength={2} />);

    expect(screen.getByText('item-1')).toBeInTheDocument();
    expect(screen.getByText('item-2')).toBeInTheDocument();
    expect(screen.queryByText('item-3')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('(Show more)'));
    expect(screen.getByText('item-3')).toBeInTheDocument();
    expect(screen.getByText('item-4')).toBeInTheDocument();
    expect(screen.getByText('(Show less)')).toBeInTheDocument();

    fireEvent.click(screen.getByText('(Show less)'));
    expect(screen.queryByText('item-3')).not.toBeInTheDocument();
    expect(screen.getByText('(Show more)')).toBeInTheDocument();
  });
});

describe('ParameterMetadata', () => {
  test('shows scalar restrictions and enum values', () => {
    render(
      <ParameterMetadata
        lookup={new IdLookup()}
        schema={{
          default: 'draft',
          minLength: 2,
          maxLength: 20,
          pattern: '^draft-',
          format: 'uri',
          enum: ['draft', 'published'],
        }}
      />
    );

    expect(screen.getByText('Default:')).toBeInTheDocument();
    expect(screen.getAllByText('draft')).toHaveLength(2);
    expect(screen.getByText('Min length:')).toBeInTheDocument();
    expect(screen.getByText('Max length:')).toBeInTheDocument();
    expect(screen.getByText('Pattern:')).toBeInTheDocument();
    expect(screen.getByText('Format:')).toBeInTheDocument();
    expect(screen.getByText('Valid values:')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
  });

  test('does not render metadata for a boolean schema', () => {
    const { container } = render(<ParameterMetadata lookup={new IdLookup()} schema={false} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  test('renders exact const metadata for falsy and structured values', () => {
    const { rerender } = render(
      <ParameterMetadata lookup={new IdLookup()} schema={{ const: false }} />
    );
    expect(screen.getByText('Constant:')).toBeInTheDocument();
    expect(screen.getByText('false')).toBeInTheDocument();

    rerender(<ParameterMetadata lookup={new IdLookup()} schema={{ const: null }} />);
    expect(screen.getByText('null')).toBeInTheDocument();

    rerender(
      <ParameterMetadata lookup={new IdLookup()} schema={{ const: { state: 'fixed' } }} />
    );
    expect(screen.getByText('{"state":"fixed"}')).toBeInTheDocument();
  });
});
