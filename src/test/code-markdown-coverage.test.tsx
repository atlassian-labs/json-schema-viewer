import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@atlaskit/code', () => {
  const MockCode = ({ children }: { children: React.ReactNode }) => (
    <code data-testid="inline-code">{children}</code>
  );
  const MockCodeBlock = ({ text, language }: { text: string; language: string }) => (
    <pre data-testid="code-block" data-language={language}>
      {text}
    </pre>
  );

  return { Code: MockCode, CodeBlock: MockCodeBlock };
});

jest.mock('react-copy-to-clipboard', () => {
  const React = require('react');
  return ({ children, onCopy }: { children: React.ReactNode; onCopy: () => void }) => (
    <button type="button" onClick={onCopy}>
      {children}
    </button>
  );
});

import { CodeBlockWithCopy } from '../code-block-with-copy';
import { BlockCodeRenderer, InlineCodeRenderer } from '../markdown/custom-renderers/Code';
import { isExternalLink, LinkRenderer } from '../markdown/custom-renderers/Link';

const BlockRenderer = BlockCodeRenderer as unknown as React.ComponentType<{
  children?: React.ReactNode;
  className?: string;
}>;
const InlineRenderer = InlineCodeRenderer as unknown as React.ComponentType<{
  children?: React.ReactNode;
  className?: string;
}>;
const Link = LinkRenderer as unknown as React.ComponentType<{
  href?: string;
  children?: React.ReactNode;
}>;

describe('CodeBlockWithCopy', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('shows copied state briefly after the copy control is activated', () => {
    jest.useFakeTimers();
    render(<CodeBlockWithCopy text="const value = 1;" language="javascript" />);

    fireEvent.click(screen.getByText('Copy'));
    expect(screen.getByText('Copied')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});

describe('Markdown code renderers', () => {
  test('detects JSON and text for blocks, while respecting an explicit language', () => {
    const { rerender } = render(<BlockRenderer>{'{"answer": 42}'}</BlockRenderer>);
    expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'json');

    rerender(<BlockRenderer>{'plain text'}</BlockRenderer>);
    expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'text');

    rerender(<BlockRenderer className="language-yaml">answer: 42</BlockRenderer>);
    expect(screen.getByTestId('code-block')).toHaveAttribute('data-language', 'yaml');
  });

  test('renders inline code with the latest children-based component API', () => {
    const { rerender } = render(<InlineRenderer>{'{"ok": true}'}</InlineRenderer>);
    expect(screen.getByTestId('inline-code')).toHaveTextContent('{"ok": true}');

    rerender(<InlineRenderer className="language-typescript">const ok = true;</InlineRenderer>);
    expect(screen.getByTestId('inline-code')).toHaveTextContent('const ok = true;');
  });
});

describe('Markdown links', () => {
  test('classifies internal links and renders their target attributes', () => {
    expect(isExternalLink('/docs')).toBe(false);
    expect(isExternalLink('./docs')).toBe(false);
    expect(isExternalLink('#section')).toBe(false);
    expect(isExternalLink('https://example.com')).toBe(true);

    const { rerender } = render(<Link href="/docs">Internal</Link>);
    const internal = screen.getByRole('link', { name: 'Internal' });
    expect(internal).toHaveAttribute('href', '/docs');
    expect(internal).toHaveAttribute('target', '_self');
    expect(internal).toHaveAttribute('rel', '');
    expect(screen.queryByLabelText('Follow')).not.toBeInTheDocument();

    rerender(<Link href="https://example.com">External</Link>);
    const external = screen.getByRole('link', { name: /External/ });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByLabelText('Follow')).toBeInTheDocument();
  });
});
