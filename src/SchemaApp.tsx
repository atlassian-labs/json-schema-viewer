import { AtlassianNavigation, Create, ProductHome } from '@atlaskit/atlassian-navigation';
import { AtlassianIcon, AtlassianLogo } from '@atlaskit/logo';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch, useHistory, withRouter } from 'react-router-dom';
import { LoadSchema } from './LoadSchema';
import { JsonSchema } from './schema';
import { SchemaView } from './SchemaView';
import { Start } from './Start';
import { PopupMenuGroup, Section, ButtonItem, LinkItem, LinkItemProps } from '@atlaskit/menu';
import { linkToRoot } from './route-path';
import { ContentPropsWithClose, PrimaryDropdown } from './PrimaryDropdown';
import { Docs } from './Docs';
import { getRecentlyViewedLinks, RecentlyViewedLink } from './recently-viewed';
import { exampleSchemas } from "./example-schemas";

const JsonSchemaHome = () => (
  <ProductHome icon={AtlassianIcon} logo={AtlassianLogo} siteTitle="JSON Schema Viewer" />
);

type NavigationButtonItemProps = {
  exampleUrl: string;
  onClick: () => void;
};

const NavigationButtonItem: React.FC<NavigationButtonItemProps> = (props) => {
  const history = useHistory();
  const linkLocation = linkToRoot(['view'], props.exampleUrl);
  const onClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    history.push(linkLocation);
    props.onClick();
  };
  return <LinkItem href={linkLocation} onClick={onClick}>{props.children}</LinkItem>
}

const NewTabLinkItem: React.FC<LinkItemProps> = (props) => <LinkItem target="_blank" rel="noopener noreferrer" {...props} />;

type RecentlyViewedMenuProps = ContentPropsWithClose & {
  recentlyViewed: Array<RecentlyViewedLink>;
};

const RecentlyViewedMenu: React.FC<RecentlyViewedMenuProps> = (props) => {
  const recentlyViewed = getRecentlyViewedLinks() || [];

  return (
    <PopupMenuGroup>
      <Section title="Recently viewed">
        {recentlyViewed.map(link => (
          <NavigationButtonItem key={link.url} onClick={props.closePopup} exampleUrl={link.url}>{link.title}</NavigationButtonItem>
        ))}
      </Section>
    </PopupMenuGroup>
  );
};

const ExampleMenu: React.FC<ContentPropsWithClose> = (props) => (
  <PopupMenuGroup>
    {Array.from(Object.entries(exampleSchemas)).map(([title, links]) => (
      <Section key={title} title={title}>
        {Array.from(Object.entries(links)).map(([linkTitle, url]) => (
          <NavigationButtonItem key={url} onClick={props.closePopup} exampleUrl={url}>{linkTitle}</NavigationButtonItem>
          ))}
      </Section>
    ))}
    <Section title="Schema repositories">
      <NewTabLinkItem href="https://www.schemastore.org/" onClick={props.closePopup}>Schemastore Repository</NewTabLinkItem>
    </Section>
  </PopupMenuGroup>
);

const HelpMenu: React.FC<ContentPropsWithClose> = (props) => {
  const history = useHistory();

  const goTo = (location: string) => {
    return (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      history.push(location);
      props.closePopup();
    };
  };

  return (
    <PopupMenuGroup>
      <Section title="Learn">
        <LinkItem href="/docs/introduction" onClick={goTo('/docs/introduction')}>Introduction</LinkItem>
        <ButtonItem onClick={goTo('/docs/usage')}>Linking your schema</ButtonItem>
        <NewTabLinkItem href="http://json-schema.org/understanding-json-schema/" onClick={props.closePopup}>Understanding JSON Schema</NewTabLinkItem>
      </Section>
      <Section title="Contribute">
        <NewTabLinkItem href="https://github.com/atlassian-labs/json-schema-viewer/issues/new" onClick={props.closePopup}>Raise issue</NewTabLinkItem>
        <NewTabLinkItem href="https://github.com/atlassian-labs/json-schema-viewer" onClick={props.closePopup}>View source code</NewTabLinkItem>
      </Section>
    </PopupMenuGroup>
  );
};

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
      <PrimaryDropdown content={props => <ExampleMenu {...props} />} text="Examples" />,
      <PrimaryDropdown content={props => <HelpMenu {...props} />} text="Help" />
    ];

    const recentlyViewed = getRecentlyViewedLinks();
    if (recentlyViewed !== undefined) {
      primaryItems.unshift(
        <PrimaryDropdown content={props => <RecentlyViewedMenu recentlyViewed={recentlyViewed} {...props} />} text="Recently viewed" />
      );
    }

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
          <Route path="/docs/:id"><Docs /></Route>
        </Switch>
      </div>
    );
  }
}

export const SchemaApp = withRouter<RouteComponentProps, typeof SchemaAppWR>(SchemaAppWR);
