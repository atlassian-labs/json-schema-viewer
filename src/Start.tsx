import EmptyState from '@atlaskit/empty-state';
import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';

export type StartProps = RouteComponentProps & {

};

export type StartState = {
  urlInput?: string;
}

export class StartWR extends React.PureComponent<StartProps, StartState> {
  private static InputWidth = styled.div`
    min-width: 600px;
  `;

  state: StartState = {

  };

  render() {
    const { history } = this.props;

    const handleOnClick = () => {
      history.push(`/view/${encodeURIComponent('#')}?url=${encodeURIComponent(this.state.urlInput || '')}`);
    };

    const onTextChange: React.FormEventHandler<HTMLInputElement> = e => {
      const currentValue = e.currentTarget.value;
      console.log('currentValue', currentValue);
      this.setState(() => ({ urlInput: currentValue || '' }));
    }

    return (
      <EmptyState
        header="Load a JSON Schema"
        description={`Put in the url to the JSON schema that you want to see documented here.`}
        primaryAction={(
          <StartWR.InputWidth>
            <TextField isCompact={false} value={this.state.urlInput || ''} onChangeCapture={onTextChange} />
            <Button label="submit" onClick={handleOnClick}>Load Schema</Button>
          </StartWR.InputWidth>
        )}
      />
    );
  }
}

export const Start = withRouter<StartProps, typeof StartWR>(StartWR)