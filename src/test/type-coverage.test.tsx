import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Type, TypeProps, isClickable } from '../Type';
import { IdLookup, InternalLookup, Lookup } from '../lookup';
import { JsonSchema } from '../schema';

const Click: TypeProps['clickElement'] = ({ fallbackTitle, reference }) => (
  <button type="button">{fallbackTitle} ({reference})</button>
);

function renderType(s: JsonSchema | undefined, lookup: Lookup = new IdLookup()) {
  return render(<Type s={s} reference="#" lookup={lookup} clickElement={Click} />);
}

describe('isClickable', () => {
  test('only marks object-like schemas with navigable content as clickable', () => {
    expect(isClickable(true)).toBe(false);
    expect(isClickable({ type: 'string' })).toBe(false);
    expect(isClickable({ type: 'object' })).toBe(true);
    expect(isClickable({ type: 'object', additionalProperties: false })).toBe(false);
    expect(isClickable({ properties: { name: { type: 'string' } } })).toBe(true);
    expect(isClickable({ patternProperties: { '^x-': { type: 'string' } } })).toBe(true);
  });
});

describe('Type', () => {
  test('renders primitives, booleans, missing schemas, and unresolved references', () => {
    const { rerender } = renderType({ type: 'string' });
    expect(screen.getByText('string')).toBeInTheDocument();

    rerender(<Type s={true} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('anything')).toBeInTheDocument();
    rerender(<Type s={false} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('nothing')).toBeInTheDocument();
    rerender(<Type s={undefined} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('anything')).toBeInTheDocument();
    rerender(
      <Type s={{ $ref: '#/missing' }} reference="#" lookup={new IdLookup()} clickElement={Click} />
    );
    expect(screen.getByText('anything')).toBeInTheDocument();
  });

  test('renders arrays with absent items, item schemas, booleans, and tuples', () => {
    const { rerender } = renderType({ type: 'array' });
    expect(document.body).toHaveTextContent('Array<anything>');

    rerender(<Type s={{ type: 'array', items: { type: 'integer' } }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(document.body).toHaveTextContent('Array<integer>');
    rerender(<Type s={{ type: 'array', items: false }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(document.body).toHaveTextContent('Array<nothing>');
    rerender(
      <Type
        s={{ type: 'array', items: [{ type: 'string' }, { type: 'number' }] }}
        reference="#"
        lookup={new IdLookup()}
        clickElement={Click}
      />
    );
    expect(document.body).toHaveTextContent('Array<anyOf [string, number]>');
  });

  test('renders all composite forms', () => {
    renderType({
      anyOf: [{ type: 'string' }, { type: 'integer' }],
      oneOf: [{ type: 'boolean' }, { type: 'null' }],
      allOf: [{ type: 'number' }, { type: 'string' }],
      not: { type: 'object', additionalProperties: false },
    });

    expect(document.body).toHaveTextContent('anyOf [string, integer]');
    expect(document.body).toHaveTextContent('oneOf [boolean, null]');
    expect(document.body).toHaveTextContent('allOf [number, string]');
    expect(document.body).toHaveTextContent('not (object)');
  });

  test('simplifies single-member composites and unresolved anyOf schemas', () => {
    const { rerender } = renderType({ anyOf: [{ type: 'string' }] });
    expect(screen.getByText('string')).toBeInTheDocument();

    rerender(
      <Type
        s={{ anyOf: [{ $ref: '#/missing' }] }}
        reference="#"
        lookup={new InternalLookup({})}
        clickElement={Click}
      />
    );
    expect(screen.getByText('anything')).toBeInTheDocument();

    rerender(<Type s={{ oneOf: [{ type: 'integer' }] }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('integer')).toBeInTheDocument();
    rerender(<Type s={{ allOf: [{ type: 'number' }] }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('number')).toBeInTheDocument();
  });

  test('uses a click element for external references and navigable objects', () => {
    const { rerender } = renderType({ $ref: 'https://example.com/schema.json' });
    expect(screen.getByRole('button')).toHaveTextContent('anything (#)');

    rerender(
      <Type
        s={{ title: 'Profile', type: 'object', properties: { name: { type: 'string' } } }}
        reference="#/profile"
        lookup={new IdLookup()}
        clickElement={Click}
      />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Profile (#/profile)');
  });

  test('resolves internal references and uses discriminant enum names', () => {
    const schema: JsonSchema = {
      definitions: {
        Thing: { title: 'Thing', type: 'object', properties: { value: { type: 'string' } } },
      },
    };
    const { rerender } = renderType({ $ref: '#/definitions/Thing' }, new InternalLookup(schema));
    expect(screen.getByRole('button')).toHaveTextContent('Thing (#/definitions/Thing)');

    rerender(
      <Type
        s={{
          oneOf: [
            { type: 'object', properties: { kind: { enum: ['cat'] } } },
            { type: 'object', properties: { kind: { enum: ['dog'] } } },
          ],
        }}
        reference="#/pets"
        lookup={new IdLookup()}
        clickElement={Click}
      />
    );
    expect(screen.getByRole('button', { name: /kind: cat/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kind: dog/ })).toBeInTheDocument();

    rerender(
      <Type
        s={{
          oneOf: [
            { type: 'object', properties: { kind: { const: false } } },
            { type: 'object', properties: { kind: { const: 0 } } },
          ],
        }}
        reference="#/constants"
        lookup={new IdLookup()}
        clickElement={Click}
      />
    );
    expect(screen.getByRole('button', { name: /kind: false/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kind: 0/ })).toBeInTheDocument();
  });

  test('renders schemas containing only required fields', () => {
    renderType({ required: ['id', 'name'] });
    expect(screen.getByText('required: id ∩ name')).toBeInTheDocument();
  });

  test('renders non-clickable objects, empty arrays, and tuple arrays', () => {
    const { rerender } = renderType({ type: 'object', additionalProperties: false });
    expect(screen.getByText('object')).toBeInTheDocument();

    rerender(<Type s={{ type: 'array', items: [] as any }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('Array<anything>')).toBeInTheDocument();
    rerender(
      <Type
        s={{ type: 'array', items: [{ type: 'string' }] }}
        reference="#"
        lookup={new IdLookup()}
        clickElement={Click}
      />
    );
    expect(document.body).toHaveTextContent('Array<string>');
  });

  test('renders inferred type unions with one, many, and empty members', () => {
    const { rerender } = renderType({ type: ['string'] as any });
    expect(screen.getByText('string')).toBeInTheDocument();

    rerender(<Type s={{ type: ['string', 'null'] as any }} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(screen.getByText('string ∪ null')).toBeInTheDocument();

    rerender(<Type s={({ type: [] } as unknown) as JsonSchema} reference="#" lookup={new IdLookup()} clickElement={Click} />);
    expect(document.body.querySelector('span')).toBeEmptyDOMElement();
  });
});
