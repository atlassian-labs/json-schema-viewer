import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import styled from 'styled-components';
import { BlockCodeRenderer, InlineCodeRenderer } from './custom-renderers/Code';
import { LinkRenderer } from './custom-renderers/Link';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';

export type MarkdownProps = {
  source: string;
};

export const blockQuoteStyles = `
padding: 8px 16px 0 16px;
border-left: 1px solid #f4f5f7;
margin: 0 0 16px;
color: #42526e;
&:after, &:before {
  content: '';
}
`;

const StyledBlockquote = styled.blockquote`
  ${blockQuoteStyles}
`;

const BlockQuoteRenderer: Components['blockquote'] = (props) => (
  <StyledBlockquote>{props.children}</StyledBlockquote>
);

const StyledHorizontalRule = styled.hr`
  border: 0;
  border-bottom: 1px solid #dfe1e6;
  height: 1px;
  margin: 16px 0;
`;

const HorizontalRuleRenderer: React.ElementType<{}> = () => <StyledHorizontalRule />;

function doesNotRequireFullBlownRenderer(input: string): boolean {
  return input.match(/^[a-zA-Z\d\s\.,\'\"\/]*$/g) !== null;
}

export const Markdown: React.FC<MarkdownProps> = (props: MarkdownProps) => {
  const { source } = props;

  if (doesNotRequireFullBlownRenderer(source)) {
    return <p>{source}</p>;
  }

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      children={source}
      components={{
        code: (props) =>
          props.inline ? <InlineCodeRenderer {...props} /> : <BlockCodeRenderer {...props} />,
        a: LinkRenderer,
        blockquote: BlockQuoteRenderer,
        hr: HorizontalRuleRenderer,
      }}
    />
  );
};
