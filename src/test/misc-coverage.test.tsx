import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { forSize } from '../breakpoints';
import { ParameterMetadata } from '../ParameterMetadata';
import { IdLookup } from '../lookup';

describe('breakpoint media queries', () => {
  test.each([
    ['phone-only', '@media (max-width: 599px)'],
    ['tablet-portrait-up', '@media (min-width: 600px)'],
    ['tablet-landscape-up', '@media (min-width: 900px)'],
    ['desktop-up', '@media (min-width: 1200px)'],
    ['big-desktop-up', '@media (min-width: 1800px)'],
  ])('creates the expected query for %s', (size, query) => {
    expect(forSize(size as any, 'color: red;')).toBe(`${query} { color: red; }`);
  });

  test('returns the fallback value for an unknown breakpoint', () => {
    expect(forSize('not-a-breakpoint' as any, 'color: red;')).toBe('');
  });
});

describe('ParameterMetadata restrictions', () => {
  test('renders collection, numeric, object, and boolean constraints', () => {
    render(
      <ParameterMetadata
        lookup={new IdLookup()}
        schema={{
          default: true,
          minItems: 1,
          maxItems: 3,
          uniqueItems: false,
          minimum: 2,
          exclusiveMinimum: true,
          maximum: 10,
          exclusiveMaximum: true,
          multipleOf: 2,
          minProperties: 1,
          maxProperties: 4,
        } as any}
      />,
    );

    for (const label of [
      'Default:',
      'Min items:',
      'Max items:',
      'Unique items:',
      'Exclusive Minimum:',
      'Exclusive Maximum:',
      'Multiple of:',
      'Min properties:',
      'Max properties:',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  test('renders numeric exclusive limits when their ordinary counterparts are absent', () => {
    render(
      <ParameterMetadata
        lookup={new IdLookup()}
        schema={{ exclusiveMinimum: 3, exclusiveMaximum: 9 } as any}
      />,
    );

    expect(screen.getByText('Exclusive Minimum:')).toBeInTheDocument();
    expect(screen.getByText('Exclusive Maximum:')).toBeInTheDocument();
  });
});
