import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Code } from '@atlaskit/code';
import type { SupportedLanguages } from '@atlaskit/code';
import { CodeBlockWithCopy } from '../../code-block-with-copy';
import type { Element } from 'hast';

const CodeBlockWrapper = styled.div`
  margin: 16px 0;
  padding: 0;
  max-height: 500px;
  overflow: auto;
`;

/**
 * Props passed to a `code` component by react-markdown.
 *
 * react-markdown 9 removed the old `inline` prop from its public types.  The
 * optional field is retained here so this renderer remains compatible with
 * the older runtime while using the node position as the fallback for newer
 * versions.
 */
export type MarkdownCodeProps = React.ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  node?: Element;
};

const detectLanguage = (code?: string) => {
  try {
    JSON.parse(code || '');
    return 'json';
  } catch (e) {
    return 'text';
  }
};

function getCodeAndLanguage(
  children: ReactNode,
  className?: string
): {
  code: string;
  language: string;
} {
  const value = Array.isArray(children) ? children[0] : children;
  const code = value == null ? '' : typeof value === 'string' ? value : String(value);
  return {
    code,
    language: className ? className.replace('language-', '') : detectLanguage(code),
  };
}

export const BlockCodeRenderer: React.FC<MarkdownCodeProps> = ({ children, className }) => {
  const { code, language } = getCodeAndLanguage(children, className);
  return (
    <CodeBlockWrapper>
      <CodeBlockWithCopy text={code} language={language as SupportedLanguages} />
    </CodeBlockWrapper>
  );
};

const BreakWord = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

export const InlineCodeRenderer: React.FC<MarkdownCodeProps> = ({ children }) => {
  const { code } = getCodeAndLanguage(children);
  return (
    <BreakWord>
      <Code>{code}</Code>
    </BreakWord>
  );
};

function isInlineCode({ inline, node }: MarkdownCodeProps): boolean {
  if (typeof inline === 'boolean') {
    return inline;
  }

  const position = node?.position;
  return !position || position.start.line === position.end.line;
}

export const CodeRenderer: React.FC<MarkdownCodeProps> = (props) => {
  const { children, className } = props;
  const { code } = getCodeAndLanguage(children, className);

  if (isInlineCode(props)) {
    return <InlineCodeRenderer>{code}</InlineCodeRenderer>;
  }

  return <code>{code}</code>;
};

export const PreRenderer: React.FC<React.ComponentPropsWithoutRef<'pre'>> = ({ children }) => {
  const child = React.Children.only(children);

  if (React.isValidElement<MarkdownCodeProps>(child) && child.type === CodeRenderer) {
    const { code, language } = getCodeAndLanguage(child.props.children, child.props.className);

    if (!isInlineCode(child.props)) {
      return (
        <CodeBlockWrapper>
          <CodeBlockWithCopy text={code} language={language as SupportedLanguages} />
        </CodeBlockWrapper>
      );
    }
  }

  return <pre>{children}</pre>;
};
