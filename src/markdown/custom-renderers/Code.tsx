import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Code } from '@atlaskit/code';
import { gridSize } from '@atlaskit/theme';
import { CodeBlockWithCopy } from '../../code-block-with-copy';
import type { CodeComponent } from 'react-markdown/lib/ast-to-react';

const CodeBlockWrapper = styled.div`
  margin: ${gridSize() * 2}px 0;
  padding: 0;
  max-height: 500px;
  overflow: auto;
`;

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
  const code = Array.isArray(children) ? children[0] : children;
  return {
    code: code || '',
    language: className ? className.replace('language-', '') : detectLanguage(code),
  };
}

export const BlockCodeRenderer: CodeComponent = ({ children, className }) => {
  const { code, language } = getCodeAndLanguage(children, className);
  return (
    <CodeBlockWrapper>
      <CodeBlockWithCopy text={code} language={language} />
    </CodeBlockWrapper>
  );
};

const BreakWord = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

export const InlineCodeRenderer: CodeComponent = ({ children, className }) => {
  const { code, language } = getCodeAndLanguage(children, className);
  return (
    <BreakWord>
      <Code text={code} language={language} />
    </BreakWord>
  );
};
