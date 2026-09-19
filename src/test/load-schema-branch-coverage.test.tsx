import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { LoadSchema } from '../LoadSchema';
import { getRecentlyViewedLinks } from '../recently-viewed';

class ErrorBoundary extends React.Component<{}, { error?: Error }> {
  state: { error?: Error } = {};

  componentDidCatch(error: Error) {
    this.setState({ error });
  }

  render() {
    return this.state.error ? <div>{this.state.error.message}</div> : this.props.children;
  }
}

describe('LoadSchema branch coverage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    delete (global as any).fetch;
  });

  test('does not fetch when the route has no schema URL', () => {
    (global as any).fetch = jest.fn();

    render(
      <MemoryRouter initialEntries={['/view/%23']}>
        <Route path="/view/:reference">
          <LoadSchema>{() => <div>Loaded</div>}</LoadSchema>
        </Route>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading schema...')).toBeInTheDocument();
    expect((global as any).fetch).not.toHaveBeenCalled();
  });

  test('renders and records a boolean schema', async () => {
    const url = 'https://example.test/boolean.json';
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(false),
    });
    const child = jest.fn((schema) => <div>Boolean schema: {String(schema)}</div>);

    render(
      <MemoryRouter initialEntries={[`/view/%23?url=${encodeURIComponent(url)}`]}>
        <Route path="/view/:reference">
          <LoadSchema>{child}</LoadSchema>
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Boolean schema: false')).toBeInTheDocument());
    expect(child).toHaveBeenCalledWith(false);
    expect(getRecentlyViewedLinks()).toEqual([{ title: url, url }]);
  });

  test('uses the URL as the recent-link title when an object has no title', async () => {
    const url = 'https://example.test/untitled.json';
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ type: 'object' }),
    });

    render(
      <MemoryRouter initialEntries={[`/view/%23?url=${encodeURIComponent(url)}`]}>
        <Route path="/view/:reference">
          <LoadSchema>{() => <div>Untitled schema</div>}</LoadSchema>
        </Route>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Untitled schema')).toBeInTheDocument());
    expect(getRecentlyViewedLinks()).toEqual([{ title: url, url }]);
  });

  test('reports a clear error when children is not a function', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ type: 'object' }),
    });
    const originalError = console.error;
    console.error = jest.fn();

    try {
      render(
        <MemoryRouter initialEntries={['/view/%23?url=https%3A%2F%2Fexample.test%2Fschema.json']}>
          <Route path="/view/:reference">
            <ErrorBoundary>
              <LoadSchema>{'not a function' as any}</LoadSchema>
            </ErrorBoundary>
          </Route>
        </MemoryRouter>
      );

      await waitFor(() =>
        expect(
          screen.getByText(
            'The children of the LoadSchema must be a function to accept the schema.'
          )
        ).toBeInTheDocument()
      );
    } finally {
      console.error = originalError;
    }
  });

  test('reloads when the URL query parameter changes', async () => {
    const firstUrl = 'https://example.test/first.json';
    const secondUrl = 'https://example.test/second.json';
    (global as any).fetch = jest.fn((requestedUrl: string) =>
      Promise.resolve({
        json: () => Promise.resolve({ title: requestedUrl === firstUrl ? 'First' : 'Second' }),
      })
    );

    const history = createMemoryHistory({
      initialEntries: [`/view/root?url=${encodeURIComponent(firstUrl)}`],
    });

    render(
      <Router history={history}>
        <LoadSchema>
          {(schema) => <div>{typeof schema === 'boolean' ? String(schema) : schema.title}</div>}
        </LoadSchema>
        <button
          type="button"
          onClick={() => history.push(`/view/root?url=${encodeURIComponent(secondUrl)}`)}
        >
          Change schema
        </button>
      </Router>
    );

    await waitFor(() => expect(screen.getByText('First')).toBeInTheDocument());
    screen.getByRole('button', { name: 'Change schema' }).click();
    await waitFor(() => expect(screen.getByText('Second')).toBeInTheDocument());
    expect((global as any).fetch).toHaveBeenCalledWith(secondUrl);
  });
});
