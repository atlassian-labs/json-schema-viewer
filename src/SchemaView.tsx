import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getSchemaFromReference, Lookup } from './lookup';
import { PathElement } from './route-path';
import { JsonSchema } from './schema';
import { SchemaExplorer } from './SchemaExplorer';
import { SideNavWithRouter } from './SideNavWithRouter';
import { Stage } from './stage';
import { extractLinks } from './side-nav-loader';

export type SchemaViewProps = RouteComponentProps & {
  basePathSegments: Array<string>;
  schema: JsonSchema;
  stage: Stage;
  lookup: Lookup;
};

export type SchemaViewState = {
  loadedState?: {
    path: Array<PathElement>;
    currentSchema: JsonSchema | undefined;
  }
};

// TODO we need to reverse engineer the schema explorer to show based on the path

function getTitle(schema: JsonSchema | undefined): string {
  if (schema === undefined) {
    return '<not found>';
  }

  if (typeof schema === 'boolean') {
    return '<anything>';
  }

  return schema.title || 'object';
}

function removeLeadingSlash(v: string): string {
  if (v.startsWith('/')) {
    return v.slice(1);
  }
  return v;
}

export class SchemaViewWR extends React.PureComponent<SchemaViewProps, SchemaViewState> {
  private static Container = styled.div`
    display: flex;
  `;

  constructor(props: SchemaViewProps) {
    super(props);
    this.setState({});
  }

  componentDidMount() {
    this.loadState(this.props.lookup);
  }



  public render() {
    const { schema, basePathSegments, lookup } = this.props;

    if (this.state.loadedState === undefined) {
      return <div>TODO put in a loading state here</div>;
    }

    const { path, currentSchema } = this.state.loadedState;

    if (currentSchema === undefined) {
      return <div>ERROR: Could not look up the schema that was requested in the URL.</div>;
    }

    if (typeof currentSchema === 'boolean') {
      return <div>TODO: Implement anything or nothing schema once clicked on.</div>
    }

    console.log(path);
    return (
      <SchemaViewWR.Container>
        <SideNavWithRouter basePathSegments={basePathSegments} links={extractLinks(schema, lookup)} />
        <SchemaExplorer
          basePathSegments={basePathSegments}
          path={path}
          schema={currentSchema}
          lookup={lookup}
          stage="both"
        />
      </SchemaViewWR.Container>
    );
  }

  private async loadState(lookup: Lookup): Promise<void> {
    const path = await this.getPathFromRoute(lookup);

    if (path.length === 0) {
      this.setState({
        loadedState: {
          path,
          currentSchema: undefined
        }
      });
    } else {
      const currentPathElement = path[path.length - 1];
      console.log('loading', currentPathElement.reference);
      const currentSchema = await getSchemaFromReference(currentPathElement.reference, lookup);

      this.setState({
        loadedState: {
          path,
          currentSchema
        }
      });
    }
  }

  private async getPathFromRoute(lookup: Lookup): Promise<Array<PathElement>> {
    const { basePathSegments } = this.props;
    const { pathname } = this.props.location;
    const pathSegments = removeLeadingSlash(pathname).split('/');
    let iterator = 0;
    while (pathSegments[iterator] !== undefined && basePathSegments[iterator] !== undefined && basePathSegments[iterator] === pathSegments[iterator]) {
      iterator++;
    }

    if (iterator === pathSegments.length) {
      console.log('render root');
      const reference = '#';
      const title = getTitle(await getSchemaFromReference(reference, lookup));
      return [{
        title,
        reference
      }];
    }

    console.log('render latest');
    return Promise.all(pathSegments.slice(iterator).map(decodeURIComponent).map(async reference => {
      const title = getTitle(await getSchemaFromReference(reference, lookup));
      return {
        title,
        reference
      };
    }));
  }
}

export const SchemaView = withRouter<SchemaViewProps, typeof SchemaViewWR>(SchemaViewWR);