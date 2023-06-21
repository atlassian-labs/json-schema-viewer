import EmptyState from '@atlaskit/empty-state';
import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import { Markdown } from './markdown';

export type StartProps = RouteComponentProps & {

};

export type StartState = {
  urlInput?: string;
}

const DevelopingSchemaInstructions = `
## Developing a JSON Schema

If you are busy writing or generating a JSON Schema and you want to get a live experience of viewing that schema using
JSON Schema Viewer then you have a few options.

### Using a locally running server

JSON Schema Viewer will work so long as your JSON Schema is accessible via a HTTP Get request from your web browser.
This means that you can just host the file on your own machine and edit it from there. For example:

1. In a terminal, go to the directory on your local filesystem that contains your JSON Schema.
1. In that directory on your local machine, type in:
   \`\`\`
   npx http-server -p 9876 --cors -c-1
   \`\`\`
1. Navigate to [http://localhost:9876/][1] and click on your JSON Schema link.
1. Copy the URL for the JSON Schema and paste it into the input above.

And there you have it! You can now view your JSON Schema here. Using this method, you can also live edit the file
on your local computer and then you can merely refresh JSON Schema Viewer in your browser and your new content will
appear live.

### Using Bitbucket Snippets

To use Bitbucket Snippets:

1. Navigate to: [https://bitbucket.org/snippets/new][2]
1. Paste your JSON Schema into the file text input and fill in the other fields.
1. Select "Permissions" => "Public" and Create Snippet.
1. Once the snippet has been created, click on the "Raw" button and copy the raw link to your file.
1. Paste that link into the input on this page.

And there you have it! You can now view your JSON Schema here. If you wish to update it, merely go back to your gist,
update the contents, re-copy the raw url (because it will have updated) and load it into JSON Schema viewer again.

### Using Github Gists

To use Github Gists:

1. Navigate to: [https://gist.github.com/][3]
1. Paste your JSON Schema into the file text input and fill in the other fields.
1. Select "Create public gist" so that the gist can be viewed by anybody.
1. Once the gist has been created, click on the "Raw" button and copy the raw link to your file.
1. Paste that link into the input on this page.

And there you have it! You can now view your JSON Schema here. If you wish to update it, merely go back to your gist,
update the contents, re-copy the raw url (because it will have updated) and load it into JSON Schema viewer again.

 [1]: http://localhost:9876/
 [2]: https://bitbucket.org/snippets/new
 [3]: https://gist.github.com/
`.trim();

export class StartWR extends React.PureComponent<StartProps, StartState> {
  public static InputWidth = styled.div`
    min-width: 600px;
  `;

  public static Flex = styled.div`
    display: flex;
    gap: 4px;
    align-items: center;
  `

  public static Guide = styled.div`
    max-width: 600px;
    text-align: left;
    margin-top: 100px;
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
            <StartWR.Flex>
              <TextField isCompact={false} value={this.state.urlInput || ''} onChange={onTextChange} />
              <Button label="submit" onClick={handleOnClick} appearance="primary">Load Schema</Button>
            </StartWR.Flex>
            <StartWR.Guide><Markdown source={DevelopingSchemaInstructions} /></StartWR.Guide>
          </StartWR.InputWidth>
        )}
      />
    );
  }
}

export const Start = withRouter<StartProps, typeof StartWR>(StartWR)
