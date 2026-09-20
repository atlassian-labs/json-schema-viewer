import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

jest.mock('../docs/introduction.md', () => 'introduction.md');
jest.mock('../docs/usage.md', () => 'usage.md');

import { Docs } from '../Docs';

function ChangeDocument() {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate('/docs/usage')}>
      Usage
    </button>
  );
}

function renderDocs(path = '/docs/introduction') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/docs/:id" element={<><Docs /><ChangeDocument /></>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Docs', () => {
  const originalFetch = (global as any).fetch;

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  test('shows a loading state while documentation is fetched', () => {
    (global as any).fetch = jest.fn(() => new Promise(() => undefined));

    renderDocs();

    expect(screen.getByText('Loading docs...')).toBeInTheDocument();
    expect(screen.getByText('Attempting to load the docs.')).toBeInTheDocument();
  });

  test('fetches and renders the requested documentation', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      text: () => Promise.resolve('# Introduction'),
    });

    renderDocs();

    await waitFor(() => expect(screen.getByText('Introduction')).toBeInTheDocument());
    expect((global as any).fetch).toHaveBeenCalledTimes(1);
  });

  test('reports an unknown document without making a request', async () => {
    (global as any).fetch = jest.fn();

    renderDocs('/docs/missing');

    await waitFor(() => expect(screen.getByText('No documentation found.')).toBeInTheDocument());
    expect(screen.getByText('There is no documentation here. Please use the top navigation to find what you are looking for.')).toBeInTheDocument();
    expect((global as any).fetch).not.toHaveBeenCalled();
  });

  test('reports fetch errors', async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error('docs unavailable'));

    renderDocs();

    await waitFor(() => expect(screen.getByText('No documentation found.')).toBeInTheDocument());
  });

  test('reloads documentation when the route id changes', async () => {
    (global as any).fetch = jest.fn()
      .mockResolvedValueOnce({ text: () => Promise.resolve('# Introduction') })
      .mockResolvedValueOnce({ text: () => Promise.resolve('# Usage') });

    renderDocs();
    await waitFor(() => expect(screen.getByText('Introduction')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Usage' }));
    await waitFor(() => expect(screen.getByText('Usage')).toBeInTheDocument());
    expect((global as any).fetch).toHaveBeenCalledTimes(2);
  });
});
