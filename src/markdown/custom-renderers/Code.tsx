import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { Code } from '@atlaskit/code';
import { gridSize } from '@atlaskit/theme';
import { CodeBlockWithCopy } from '../../code-block-with-copy';

export type CodeRendererProps = {
  value?: string;
  language?: string;
};

const CodeBlockWrapper = styled.div`
  margin: ${gridSize() * 2}px 0;
  padding: 0;
  max-height: 500px;
  overflow: auto;
`;

export const BlockCodeRenderer: React.ElementType<CodeRendererProps> = (props) => {
  return (
    <CodeBlockWrapper>
      <CodeBlockWithCopy text={props.value || ''} language={props.language || 'text'} />
    </CodeBlockWrapper>
  );
};

const BreakWord = styled.span`
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

export const InlineCodeRenderer: React.ElementType<CodeRendererProps> = (props) => {
  return (
    <BreakWord><Code text={props.value || ''} language={props.language || 'text'} /></BreakWord>
  );
};
