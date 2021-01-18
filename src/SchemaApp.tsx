import { AtlassianNavigation, Create, ProductHome } from '@atlaskit/atlassian-navigation';
import { AtlassianIcon, AtlassianLogo } from '@atlaskit/logo';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch, useHistory, withRouter } from 'react-router-dom';
import { LoadSchema } from './LoadSchema';
import { JsonSchema } from './schema';
import { SchemaView } from './SchemaView';
import { Start } from './Start';

const ProductHomeExample = () => (
  <ProductHome icon={AtlassianIcon} logo={AtlassianLogo} />
);

const NewSchema: React.FC = () => {
  const history = useHistory();
  const isStart = history.location.pathname === '/start';
  if (isStart) {
    return <></>;
  }

  return (
    <Create
      buttonTooltip="Render a new JSON Schema"
      iconButtonTooltip="Render a new JSON Schema"
      text="Load new schema"
      onClick={() => history.push('/start')}
    />
  );
};

export type LoadedState = {
  schemaUrl: string;
  loadedSchema: JsonSchema;
}

export type SchemaAppState = {
  loadedState?: LoadedState;
}

class SchemaAppWR extends React.PureComponent<RouteComponentProps, SchemaAppState> {
  state: SchemaAppState = {

  };

   render() {
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

export const SchemaApp = withRouter<RouteComponentProps, typeof SchemaAppWR>(SchemaAppWR);