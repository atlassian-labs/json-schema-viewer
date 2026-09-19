import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../SchemaApp', () => ({
  SchemaApp: () => <div data-testid="schema-app">Schema application</div>,
}));

import { App } from '../BrowserApp';

describe('BrowserApp', () => {
  test('mounts the schema application inside a browser router', () => {
    render(<App />);

    expect(screen.getByTestId('schema-app')).toHaveTextContent('Schema application');
  });
});
