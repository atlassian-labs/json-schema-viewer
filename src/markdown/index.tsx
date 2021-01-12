import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { colors, gridSize } from '@atlaskit/theme';
import { BlockCodeRenderer, InlineCodeRenderer } from './custom-renderers/Code';
/*
import {
  createHeadingRenderer,
  AddOnThisPageHeading,
  OnHeadingVisibilityChange,
} from './custom-renderers/Heading';
*/
// import TableRenderer from './custom-renderers/Table';
import { LinkRenderer } from './custom-renderers/Link';
//import TableCellRenderer from './custom-renderers/TableCell';
//import TableHeadRenderer from './custom-renderers/TableHead';
//import TableRowRenderer from './custom-renderers/TableRow';

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

const StyledBlockquote = styled.blockquote`${blockQuoteStyles}`;

type BlockQuoteRendererProps = {
  children: JSX.Element[];
};

const BlockQuoteRenderer: React.ElementType<BlockQuoteRendererProps> = (props) => (
  <StyledBlockquote>{props.children}</StyledBlockquote>
);

const StyledThematicBreak = styled.hr`
  border: 0;
  border-bottom: 1px solid ${colors.N40};
  height: 1px;
  margin: ${gridSize() * 2}px 0;
`;

const ThematicBreakRenderer: React.ElementType<{}> = () => (
  <StyledThematicBreak />
);

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
      skipHtml={true}
      source={source}
      renderers={
        {
          code: BlockCodeRenderer,
          inlineCode: InlineCodeRenderer,
          link: LinkRenderer,
          blockquote: BlockQuoteRenderer,
          thematicBreak: ThematicBreakRenderer,
        }
      }
    />
  );
};