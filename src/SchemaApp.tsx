import { AtlassianNavigation, Create, ProductHome } from '@atlaskit/atlassian-navigation';
import { AtlassianIcon, AtlassianLogo } from '@atlaskit/logo';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch, useHistory, withRouter } from 'react-router-dom';
import { LoadSchema } from './LoadSchema';
import { JsonSchema } from './schema';
import { SchemaView } from './SchemaView';
import { Start } from './Start';
import { PopupMenuGroup, Section, ButtonItem } from '@atlaskit/menu';
import { linkToRoot } from './route-path';
import { ContentPropsWithClose, PrimaryDropdown } from './PrimaryDropdown';
import { ContentProps } from '@atlaskit/popup';

const JsonSchemaHome = () => (
  <ProductHome icon={AtlassianIcon} logo={AtlassianLogo} siteTitle="JSON Schema Viewer" />
);

type NavigationButtonItemProps = {
  exampleUrl: string;
  onClick: () => void;
};

const NavigationButtonItem: React.FC<NavigationButtonItemProps> = (props) => {
  const history = useHistory();
  const onClick = () => {
    history.push(
      linkToRoot(['view'], props.exampleUrl)
    );
    props.onClick();
  };
  return <ButtonItem onClick={onClick}>{props.children}</ButtonItem>
}

const ExampleMenu: React.FC<ContentPropsWithClose> = (props) => (
  <PopupMenuGroup>
    <Section title="Schema examples">
      <NavigationButtonItem onClick={props.closePopup} exampleUrl="https://unpkg.com/@forge/manifest@latest/out/schema/manifest-schema.json">Atlassian Forge</NavigationButtonItem>
      <NavigationButtonItem onClick={props.closePopup} exampleUrl="https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/schemas/v3.0/schema.json">OpenAPI (v3)</NavigationButtonItem>
      <NavigationButtonItem onClick={props.closePopup} exampleUrl="https://json.schemastore.org/swagger-2.0">Swagger (v2)</NavigationButtonItem>
      <NavigationButtonItem onClick={props.closePopup} exampleUrl="https://json.schemastore.org/package">package.json</NavigationButtonItem>
    </Section>
  </PopupMenuGroup>
);


/*
Menus:

 - Examples
   - Atlassian Forge
   - OpenAPI v3
   - Swagger v2
   - package.json
   -
 - Learn JSON Schema
 - Raise issue
 - Visit repository
 - About
*/

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
    const primaryItems = [
      <PrimaryDropdown content={props => <ExampleMenu {...props} />} text="Examples" />
    ];

    return (
      <div>
        <AtlassianNavigation
          label="Json schema viewer header"
          primaryItems={primaryItems}
          renderCreate={NewSchema}
          renderProductHome={JsonSchemaHome}

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