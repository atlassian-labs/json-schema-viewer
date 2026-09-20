import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { LoadSchema } from '../LoadSchema';
import { Start } from '../Start';
import { addRecentlyViewedLink, getRecentlyViewedLinks } from '../recently-viewed';

const RECENT_STORAGE_KEY = 'recently-viewed.v1';

function LocationText() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

describe('recently viewed links', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('deduplicates by URL, moves the current link to the front, and caps at ten links', () => {
    for (let index = 0; index < 12; index += 1) {
      addRecentlyViewedLink({ title: `Schema ${index}`, url: `https://example.test/${index}` });
    }

    addRecentlyViewedLink({ title: 'Updated schema 5', url: 'https://example.test/5' });

    expect(getRecentlyViewedLinks()).toEqual([
      { title: 'Updated schema 5', url: 'https://example.test/5' },
      ...[11, 10, 9, 8, 7, 6, 4, 3, 2].map((value) => {
        return { title: `Schema ${value}`, url: `https://example.test/${value}` };
      }),
    ]);
  });

  test('ignores malformed JSON in local storage', () => {
    window.localStorage.setItem(RECENT_STORAGE_KEY, '{not valid json');

    expect(getRecentlyViewedLinks()).toBeUndefined();
    expect(() =>
      addRecentlyViewedLink({ title: 'Recovered', url: 'https://example.test/recovered' })
    ).not.toThrow();
    expect(getRecentlyViewedLinks()).toEqual([
      { title: 'Recovered', url: 'https://example.test/recovered' },
    ]);
  });
});

describe('Start', () => {
  test('navigates to the encoded schema URL on submit', () => {
    render(
      <MemoryRouter initialEntries={['/start']}>
        <Routes>
          <Route path="*" element={<><Start /><LocationText /></>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://example.test/schema.json?version=1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load Schema' }));

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/view/%23?url=https%3A%2F%2Fexample.test%2Fschema.json%3Fversion%3D1'
    );
  });
});

describe('LoadSchema', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    delete (global as any).fetch;
  });

  test('loads a schema, renders its children, and records the titled link', async () => {
    const schema = { title: 'Example schema', type: 'object' };
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(schema),
    });
    const child = jest.fn((loadedSchema) => <div>Loaded: {loadedSchema.title}</div>);

    render(
      <MemoryRouter initialEntries={['/view/%23?url=https%3A%2F%2Fexample.test%2Fschema.json']}>
        <Routes>
          <Route path="/view/:reference" element={<LoadSchema>{child}</LoadSchema>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading schema...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Loaded: Example schema')).toBeInTheDocument());
    expect(child).toHaveBeenCalledWith(schema);
    expect(getRecentlyViewedLinks()).toEqual([
      { title: 'Example schema', url: 'https://example.test/schema.json' },
    ]);
  });

  test('renders a useful error when fetching the schema fails', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('network unavailable'));

    render(
      <MemoryRouter initialEntries={['/view/%23?url=https%3A%2F%2Fexample.test%2Fmissing.json']}>
        <Routes>
          <Route path="/view/:reference" element={<LoadSchema>{() => <div>Should not render</div>}</LoadSchema>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Schema load failed')).toBeInTheDocument());
    expect(screen.getByText('Error: network unavailable')).toBeInTheDocument();
    expect(getRecentlyViewedLinks()).toBeUndefined();
  });
});
