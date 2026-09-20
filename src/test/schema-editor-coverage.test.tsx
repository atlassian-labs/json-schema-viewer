import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockSetDiagnosticsOptions = jest.fn();
const mockSetSelection = jest.fn();
const mockRevealRangeAtTop = jest.fn();
const mockGetEditors = jest.fn(() => [
  {
    setSelection: mockSetSelection,
    revealRangeAtTop: mockRevealRangeAtTop,
  },
]);
const mockMonaco = {
  languages: {
    json: {
      jsonDefaults: { setDiagnosticsOptions: mockSetDiagnosticsOptions },
    },
  },
  editor: { getEditors: mockGetEditors },
};
let mockMonacoValue: typeof mockMonaco | undefined = mockMonaco;

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: (props: { value: string; onValidate: (markers: unknown[]) => void }) => (
    <div data-testid="editor" data-value={props.value}>
      <button onClick={() => props.onValidate([{ message: 'invalid' }])}>Validate</button>
    </div>
  ),
  useMonaco: () => mockMonacoValue,
}));
jest.mock('../monaco-helpers', () => ({
  ScrollType: { Smooth: 'smooth' },
}));

import { SchemaEditor } from '../SchemaEditor';

const schema = { type: 'object', properties: { name: { type: 'string' } } } as any;

describe('SchemaEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMonacoValue = mockMonaco;
  });

  test('configures JSON diagnostics and formats the initial editor content', () => {
    const onValidate = jest.fn();

    render(<SchemaEditor initialContent={{ name: 'Ada' }} schema={schema} onValidate={onValidate} />);

    expect(mockSetDiagnosticsOptions).toHaveBeenCalledWith({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: 'https://json-schema.app/example.json',
          fileMatch: ['a://b/example.json'],
          schema,
        },
      ],
    });
    expect(screen.getByTestId('editor')).toHaveAttribute(
      'data-value',
      expect.stringContaining('// Copy-and-paste your JSON in here to live-edit\n'),
    );
    expect(screen.getByTestId('editor')).toHaveAttribute('data-value', expect.stringContaining('"name": "Ada"'));

    fireEvent.click(screen.getByText('Validate'));
    expect(onValidate).toHaveBeenCalledWith([{ message: 'invalid' }]);
  });

  test('updates diagnostics when the schema changes', () => {
    const onValidate = jest.fn();
    const { rerender } = render(
      <SchemaEditor initialContent={null} schema={schema} onValidate={onValidate} />,
    );
    const nextSchema = { type: 'array', items: { type: 'number' } } as any;

    rerender(<SchemaEditor initialContent={null} schema={nextSchema} onValidate={onValidate} />);

    expect(mockSetDiagnosticsOptions).toHaveBeenLastCalledWith(
      expect.objectContaining({ schemas: [expect.objectContaining({ schema: nextSchema })] }),
    );
  });

  test('selects and reveals a validation range in every Monaco editor', () => {
    const range = { startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 8 };

    render(
      <SchemaEditor initialContent={{}} schema={schema} validationRange={range} onValidate={jest.fn()} />,
    );

    expect(mockSetSelection).toHaveBeenCalledWith(range);
    expect(mockRevealRangeAtTop).toHaveBeenCalledWith(range, 'smooth');
  });

  test('does nothing when Monaco is not ready or no range is supplied', () => {
    mockMonacoValue = undefined;
    const { rerender } = render(<SchemaEditor initialContent={{}} schema={schema} onValidate={jest.fn()} />);

    expect(mockSetDiagnosticsOptions).not.toHaveBeenCalled();
    expect(mockGetEditors).not.toHaveBeenCalled();

    mockMonacoValue = mockMonaco;
    rerender(
      <SchemaEditor initialContent={{}} schema={schema} validationRange={undefined} onValidate={jest.fn()} />,
    );

    expect(mockGetEditors).not.toHaveBeenCalled();
  });
});
