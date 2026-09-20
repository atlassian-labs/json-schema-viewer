import React from 'react';
import styled from 'styled-components';
import { CodeBlock } from '@atlaskit/code';
import type { SupportedLanguages } from '@atlaskit/code';
import CopyIcon from '@atlaskit/icon/core/copy';
import EditorSuccessIcon from '@atlaskit/icon/core/success';
import CopyToClipboard from 'react-copy-to-clipboard';

// react-copy-to-clipboard predates React 18's JSX types.
const CopyToClipboardCompat = CopyToClipboard as unknown as React.ComponentType<{
  onCopy: () => void;
  text: string;
  children: React.ReactNode;
}>;

/**
 * Hiding the copy button needs to be done in a Screen Reader Compliant way. We use the approach from this page:
 * https://webaim.org/techniques/css/invisiblecontent/
 */
const Container = styled.div`
  position: relative;

  &:not(:hover) .copy {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`;

const CopyStyled = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
  background-color: rgb(64, 64, 64);
  padding: 0.2rem 0.3rem 0.2rem 0.2rem;
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
  language?: SupportedLanguages;
  onCopy: () => void;
};

const CopyComponent: React.FC<CopyComponentProps> = (props) => {
  return (
    <CopyStyled className="copy">
      <CopyToClipboardCompat
        onCopy={props.onCopy}
        text={typeof props.text === 'string' ? props.text : ''}
      >
        <CopyContainer>
          <CopyIcon label="Copy" size="small" />
          Copy
        </CopyContainer>
      </CopyToClipboardCompat>
    </CopyStyled>
  );
};

const CopySuccessSFC: React.FC = () => (
  <CopyStyled>
    <CopyContainer>
      <EditorSuccessIcon label="Copied" size="small" color="currentColor" />
      Copied
    </CopyContainer>
  </CopyStyled>
);

export type CodeBlockWithCopyProps = {
  text: string;
  language?: SupportedLanguages;
};

export class CodeBlockWithCopy extends React.PureComponent<
  CodeBlockWithCopyProps,
  CodeBlockWithCopyState
> {
  UNSAFE_componentWillMount() {
    this.setState({
      showCopied: false,
    });
  }

  render() {
    const { text, language } = this.props;

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

    return <CopyComponent onCopy={() => this.onCopy()} text={text} language={language} />;
  }

  private onCopy() {
    // Change the state
    this.setState({
      showCopied: true,
    });

    // Set the timeout
    setTimeout(() => {
      this.setState({
        showCopied: false,
      });
    }, 2000);
  }
}
