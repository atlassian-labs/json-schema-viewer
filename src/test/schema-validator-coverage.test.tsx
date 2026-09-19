import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@atlaskit/theme', () => ({
  colors: { R500: 'red', Y300: 'yellow', B300: 'blue', G300: 'green' },
}));

jest.mock('../monaco-helpers', () => ({
  MarkerSeverity: { Hint: 1, Info: 2, Warning: 4, Error: 8 },
}));

jest.mock('@atlaskit/empty-state', () => (props: any) => <div>{props.header}</div>);
jest.mock('@atlaskit/icon/glyph/error', () => (props: any) => <span>{props.label}</span>);
jest.mock('@atlaskit/icon/glyph/warning', () => (props: any) => <span>{props.label}</span>);
jest.mock('@atlaskit/icon/glyph/info', () => (props: any) => <span>{props.label}</span>);
jest.mock('@atlaskit/icon/glyph/editor/success', () => () => <span>success</span>);

jest.mock('@atlaskit/table', () => ({
  __esModule: true,
  default: ({ children }: any) => <table>{children}</table>,
  THead: ({ children }: any) => <thead><tr>{children}</tr></thead>,
  TBody: ({ rows, children }: any) => <tbody>{rows.map(children)}</tbody>,
  Row: ({ children }: any) => <tr>{children}</tr>,
  Cell: ({ children }: any) => <td>{children}</td>,
  SortableColumn: ({ children }: any) => <th>{children}</th>,
}));

import { SchemaValidator } from '../SchemaValidator';

describe('SchemaValidator', () => {
  test('shows the success state when validation has no issues', () => {
    render(<SchemaValidator results={[]} onSelectRange={jest.fn()} />);

    expect(screen.getByText('No validation issues!')).toBeInTheDocument();
  });

  test('sorts issues, labels severity, and selects the clicked marker range', () => {
    const onSelectRange = jest.fn();
    const results = [
      { severity: 4, message: 'warning', startLineNumber: 3, startColumn: 2, endLineNumber: 3, endColumn: 8 },
      { severity: 8, message: 'error', startLineNumber: 1, startColumn: 4, endLineNumber: 2, endColumn: 1 },
      { severity: 2, message: 'info', startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 4 },
      { severity: 1, message: 'hint', startLineNumber: 4, startColumn: 1, endLineNumber: 4, endColumn: 2 },
    ] as any;

    render(<SchemaValidator results={results} onSelectRange={onSelectRange} />);

    expect(screen.getAllByRole('row')[1]).toHaveTextContent('error');
    expect(screen.getAllByRole('row')[2]).toHaveTextContent('info');
    expect(screen.getAllByText('Warning')).toHaveLength(2);
    expect(screen.getAllByText('Hint')).toHaveLength(2);

    fireEvent.click(screen.getByText('1:4-2:1'));
    expect(onSelectRange).toHaveBeenCalledWith({
      startLineNumber: 1,
      startColumn: 4,
      endLineNumber: 2,
      endColumn: 1,
    });
  });
});
