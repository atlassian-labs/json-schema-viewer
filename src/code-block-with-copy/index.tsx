import React from 'react';
import styled from 'styled-components';
import { CodeBlock } from '@atlaskit/code';
import CopyIcon from '@atlaskit/icon/glyph/copy';
import EditorSuccessIcon from '@atlaskit/icon/glyph/editor/success';
import CopyToClipboard from 'react-copy-to-clipboard';

/**
 * Hiding the copy button needs to be done in a Screen Reader Compliant way. We use the approach from this page:
 * https://webaim.org/techniques/css/invisiblecontent/
 */
const Container = styled.div`
  position: relative;

  &:not(:hover) .copy {
    position:absolute;
    left:-10000px;
    top:auto;
    width:1px;
    height:1px;
    overflow:hidden;
  }
`;

const CopyStyled = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
  background-color: rgb(64, 64, 64);
  padding: .2rem .3rem .2rem .2rem;
  border-radius: 2px;

  cursor: copy;
  color: white;
`;

const CodeContainer = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  width: 100%;

  z-index: 0;
`;

const CopyContainer = styled.div`
  font-size: 12px;
  min-width: 64px;
  text-align: center;

  & span:first-child {
    margin-right: 2px;
    position: relative;
    top: 1px;
  }
`;

export type CodeBlockWithCopyState = {
  showCopied: boolean;
};

type CopyComponentProps = {
  text: string;
  language?: string;
  onCopy: () => void;
};

const CopyComponent: React.FC<CopyComponentProps> = (props) => {
  return (
    <CopyStyled className="copy">
      <CopyToClipboard
        onCopy={props.onCopy}
        text={typeof props.text === 'string' ? props.text : ''}
      >
        <CopyContainer><CopyIcon label="Copy" size="small" />Copy</CopyContainer>
      </CopyToClipboard>
    </CopyStyled>
  );
};

const CopySuccessSFC: React.FC = () => (
  <CopyStyled>
    <CopyContainer><EditorSuccessIcon label="Copied" size="small" primaryColor="#57D9A3" />Copied</CopyContainer>
  </CopyStyled>
);

export type CodeBlockWithCopyProps = {
  text: string;
  language?: string;
};

export class CodeBlockWithCopy extends React.PureComponent<CodeBlockWithCopyProps, CodeBlockWithCopyState> {
  UNSAFE_componentWillMount() {
    this.setState({
      showCopied: false
    });
  }

  render() {
    const {
      text,
      language,
    } = this.props;

    const copyContent = this.getCopyContent();

    return (
      <Container>
        {copyContent}
        <CodeContainer>
          <CodeBlock {...this.props} />
        </CodeContainer>
      </Container>
    );
  }

  private getCopyContent(): JSX.Element {
    const { showCopied } = this.state;

    if (showCopied) {
      return <CopySuccessSFC />;
    }

    const { text, language } = this.props;

    return (
      <CopyComponent
        onCopy={() => this.onCopy()}
        text={text}
        language={language}
      />
    );
  }

  private onCopy() {
    // Change the state
    this.setState({
      showCopied: true
    });

    // Set the timeout
    setTimeout(
      () => {
        this.setState({
          showCopied: false
        });
      },
      2000
    );
  }
}
