import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import styled from 'styled-components';
import { colors, gridSize } from '@atlaskit/theme';
import { BlockCodeRenderer, InlineCodeRenderer } from './custom-renderers/Code';
import { LinkRenderer } from './custom-renderers/Link';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';

export type MarkdownProps = {
  source: string;
};

export const blockQuoteStyles = `
padding: ${gridSize()}px ${gridSize() * 2}px 0 ${gridSize() * 2}px;
border-left: 1px solid ${colors.N50};
margin: 0 0 ${gridSize() * 2}px;
color: ${colors.N80};
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
  border-bottom: 1px solid ${colors.N40};
  height: 1px;
  margin: ${gridSize() * 2}px 0;
`;

const HorizontalRuleRenderer: React.ElementType<{}> = () => <StyledHorizontalRule />;

function doesNotRequireFullBlownRenderer(input: string): boolean {
  return input.match(/^[a-zA-Z\d\s\.,\'\"\/]*$/g) !== null;
}

export const Markdown: React.FC<MarkdownProps> = (props: MarkdownProps) => {
  const {
    source,
  } = props;

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
