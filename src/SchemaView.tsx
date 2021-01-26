import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getSchemaFromReference, InternalLookup, Lookup } from './lookup';
import { PathElement } from './route-path';
import { JsonSchema } from './schema';
import { SchemaExplorer } from './SchemaExplorer';
import { SideNavWithRouter } from './SideNavWithRouter';
import { Stage } from './stage';
import { extractLinks } from './side-nav-loader';
import { SchemaEditor } from './SchemaEditor';
import { generateJsonExampleFor, isErrors } from './example';

export type SchemaViewProps = RouteComponentProps & {
  basePathSegments: Array<string>;
  schema: JsonSchema;
  stage: Stage;
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

export class SchemaViewWR extends React.PureComponent<SchemaViewProps> {
  private static Container = styled.div`
    display: flex;
  `;

  private static EditorContainer = styled.div`
    min-width: 500px;
    max-width: 500px;

    section {
      padding: 0;
      margin: 0;
    }
  `;

  public render() {
    const { schema, basePathSegments } = this.props;

    const lookup = new InternalLookup(schema);
    const path = this.getPathFromRoute(lookup);

    if (path.length === 0) {
      return <div>Error: Could not work out what to load from the schema.</div>
    }

    const currentPathElement = path[path.length - 1];
    const currentSchema = getSchemaFromReference(currentPathElement.reference, lookup);

    if (currentSchema === undefined) {
      return <div>ERROR: Could not look up the schema that was requested in the URL.</div>;
    }

    if (typeof currentSchema === 'boolean') {
      return <div>TODO: Implement anything or nothing schema once clicked on.</div>
    }

    const generatedExample = generateJsonExampleFor(schema, lookup, 'both');
    const fullExample: unknown = isErrors(generatedExample) ? {} : generatedExample.value;

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
        <SchemaViewWR.EditorContainer>
          <SchemaEditor
            initialContent={fullExample}
            schema={schema}
          />
        </SchemaViewWR.EditorContainer>
      </SchemaViewWR.Container>
    );
  }

  private getPathFromRoute(lookup: Lookup): Array<PathElement> {
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
      const title = getTitle(getSchemaFromReference(reference, lookup));
      return [{
        title,
        reference
      }];
    }

    console.log('render latest');
    return pathSegments.slice(iterator).map(decodeURIComponent).map(reference => {
      const title = getTitle(getSchemaFromReference(reference, lookup));
      return {
        title,
        reference
      };
    });
  }
}

export const SchemaView = withRouter<SchemaViewProps, typeof SchemaViewWR>(SchemaViewWR);