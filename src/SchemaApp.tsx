import { AtlassianNavigation, Create, ProductHome } from '@atlaskit/atlassian-navigation';
import { AtlassianIcon, AtlassianLogo } from '@atlaskit/logo';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch, useHistory, withRouter } from 'react-router-dom';
import { LoadSchema } from './LoadSchema';
import { JsonSchema } from './schema';
import { SchemaView, SchemaViewProps } from './SchemaView';
import { Start } from './Start';

const ProductHomeExample = () => (
  <ProductHome icon={AtlassianIcon} logo={AtlassianLogo} />
);

const NewSchema: React.FC = () => {
  const history = useHistory();
  return (
    <Create
      buttonTooltip="Render a new JSON Schema"
      iconButtonTooltip="Render a new JSON Schema"
      text="New schema"
      onClick={() => history.push('/start')}
    />
  );
};

export type SchemaAppProps = RouteComponentProps & {

};

export type LoadedState = {
  schemaUrl: string;
  loadedSchema: JsonSchema;
}

export type SchemaAppState = {
  loadedState?: LoadedState;
}

export class SchemaAppWR extends React.PureComponent<SchemaAppProps, SchemaAppState> {
  state: SchemaAppState = {

  };

   render() {
    const { history } = this.props;
    const { loadedState } = this.state;

    return (
      <div>
        <AtlassianNavigation
          label="Json schema viewer header"
          primaryItems={[]}
          renderCreate={NewSchema}
          renderProductHome={ProductHomeExample}
        />
        <Switch>
          <Route exact={true} path="/"><Redirect to="/start" /></Route>
          <Route exact={true} path="/start">
            <Start />
          </Route>
          <Route path="/view">
            <LoadSchema>
              {(schema) => (
                <SchemaView
                  basePathSegments={['view']}
                  schema={schema}
                  stage="both"
                />
              )}
            </LoadSchema>
          </Route>
        </Switch>
      </div>
    );
  }
}

export const SchemaApp = withRouter<SchemaAppProps, typeof SchemaAppWR>(SchemaAppWR);