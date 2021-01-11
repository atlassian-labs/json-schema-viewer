import React from 'react';
import { intersperse } from './jsx-util';
import styled from 'styled-components';
import { Code } from '@atlaskit/code';
import Lozenge from '@atlaskit/lozenge';
import Tooltip from '@atlaskit/tooltip';

export type RenderElementProps = {
  text: string;
};

export type RenderElement = React.ComponentClass<RenderElementProps>;

export type ElementAndTooltip = {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any;
  tooltip?: string;
};

export type ExpandibleListProps = {
  elements: ElementAndTooltip[];
  collapsedMaxLength: number;
  renderElement?: RenderElement;
};

export type ExpandibleListState = {
  expanded: boolean;
};

class InlineCodeRenderElement extends React.PureComponent<RenderElementProps> {
  render() {
    return <Code text={this.props.text} language="text"/>;
  }
}

export class LozengeRenderElement extends React.PureComponent<RenderElementProps> {
  render() {
    return <Lozenge>{this.props.text}</Lozenge>;
  }
}

type RendererProps = {
  RE: RenderElement;
  e: ElementAndTooltip;
};

const Inline = styled.span`
    display: inline-block;
`;

const Renderer: React.FC<RendererProps> = props => {
  if (props.e.tooltip === undefined) {
    return <props.RE text={`${props.e.element}`} />;
  } else {
    return <Inline><Tooltip content={props.e.tooltip}><props.RE text={`${props.e.element}`} /></Tooltip></Inline>;
  }
};

export class ExpandibleList extends React.PureComponent<ExpandibleListProps, ExpandibleListState> {
  private static Link = styled.a`
      margin-left: 10px;
  `;

  UNSAFE_componentWillMount() {
    this.setState({
      expanded: false
    });
  }

  render() {
    const { elements, collapsedMaxLength, renderElement } = this.props;
    const { expanded } = this.state;

    const RE: RenderElement = renderElement || InlineCodeRenderElement;

    if (elements.length <= collapsedMaxLength) {
      const renderedElements = elements.map((e, i) => <Renderer key={i} RE={RE} e={e} />);
      return <span>{intersperse(renderedElements, ', ')}</span>;
    }

    if (expanded) {
      const renderedElements = elements.map((e, i) => <Renderer key={i} RE={RE} e={e} />);
      return (
        <span>
          {intersperse(renderedElements, ', ')}
          <ExpandibleList.Link onClick={(e) => this.expand(e, false)}>(Show less)</ExpandibleList.Link>
        </span>
      );
    } else {
      const renderedElements = elements.slice(0, collapsedMaxLength)
        .map((e, i) => <Renderer key={i} RE={RE} e={e} />);

      return (
        <span>
          {intersperse(renderedElements, ', ')} ...
          <ExpandibleList.Link onClick={(e) => this.expand(e, true)}>(Show more)</ExpandibleList.Link>
        </span>
      );
    }
  }

  private expand(e: React.MouseEvent<HTMLElement>, expanded: boolean) {
    e.preventDefault();
    this.setState({
      expanded
    });
  }
}