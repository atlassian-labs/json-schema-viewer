import React from 'react';
import { JsonSchema, JsonSchema1 } from './schema';
import { getSchemaFromResult, Lookup } from './lookup';
import { ParameterView } from './Parameter';
import styled from 'styled-components';
import Button from '@atlaskit/button';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import { Markdown } from './markdown';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Tabs from '@atlaskit/tabs';
import { TabData, OnSelectCallback } from '@atlaskit/tabs/types';
import { CodeBlockWithCopy } from './code-block-with-copy';
import { generateJsonExampleFor, isExample, Example, Errors } from './example';
import { Stage, shouldShowInStage } from './stage';
import { linkTo, PathElement } from './route-path';
import { ClickElement } from './Type';
import { Link, LinkProps, useHistory } from 'react-router-dom';
import { getTitle } from './title';
import { LinkPreservingSearch } from './search-preserving-link';

interface SEPHeadProps {
  basePathSegments: Array<string>;
  path: PathElement[];
  pathExpanded: boolean;
  onExpandClick: () => void;
}

const Head = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    margin: 0;
    padding: 0;
`;

const Path = styled.div`
    padding-left: 20px;
`;

function getObjectPath(basePathSegments: Array<string>, path: PathElement[]): JSX.Element[] {
  return path.map((pe, i) => (
    <BreadcrumbsItem
      key={`${pe.title}-${i}`}
      text={pe.title}
      component={() => <LinkPreservingSearch to={linkTo(basePathSegments, path.slice(0, i+1).map(p => p.reference))}>{getTitle(pe.reference, { title: pe.title !== 'object' ? pe.title : undefined })}</LinkPreservingSearch>}
    />
  ));
}

const BackButton: React.FC<LinkProps> = props => {
  const history = useHistory();
  return (
    <Button
      key="backButton"
      iconBefore={<ChevronLeftIcon label="Back" />}
      href={props.href}
      onClick={e => {
        e.preventDefault();
        history.push(props.href || '');
      }}
    >Back
    </Button>
  );
}

function init<A>(arr: Array<A>): Array<A> {
  if (arr.length === 0) {
    return arr;
  }

  return arr.slice(0, arr.length - 1);
}

const SEPHead = (props: SEPHeadProps) => {
  const onExpandClick = () => {
    props.onExpandClick();
  };

  const ActionButton = props.path.length <= 1
    ? <h1>Root</h1>
    : (
      <LinkPreservingSearch to={linkTo(props.basePathSegments, init(props.path.map(p => p.reference)))} component={BackButton} />
    );

  return (
    <Head>
      <div>{ActionButton}</div>
      <Path>
        <BreadcrumbsStateless
          isExpanded={props.pathExpanded}
          onExpand={onExpandClick}
        >
          {getObjectPath(props.basePathSegments, props.path)}
        </BreadcrumbsStateless>
      </Path>
    </Head>
  );
};

type ExpandProps = {
  onOpen: string;
  onClosed: string;
};

type ExpandState = {
  open: boolean;
};

class Expand extends React.PureComponent<ExpandProps, ExpandState> {
  UNSAFE_componentWillMount() {
    this.setState({
      open: false
    });
  }

  render() {
    const onClick = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      this.setState(s => ({
        open: !s.open
      }));
    };
    return (
      <>
        <a href="#" onClick={onClick}>{this.state.open ? this.props.onOpen : this.props.onClosed}</a>
        {this.state.open && this.props.children}
      </>
    );
  }
}

type SchemaExplorerExampleProps = {
  schema: JsonSchema;
  lookup: Lookup;
  stage: Stage;
};

const FullWidth = styled.div`
    width: 100%;
`;

const ErrorHeading = styled.h3`
    font-size: 14px;
    padding: 8px 0;
`;

const SchemaExplorerExample: React.FC<SchemaExplorerExampleProps> = props => {
  const potentialExample = generateJsonExampleFor(props.schema, props.lookup, props.stage);

  if (isExample(potentialExample)) {
    return (
      <FullWidth>
        <CodeBlockWithCopy text={JSON.stringify(potentialExample.value, null, 2)} language="json" />
      </FullWidth>
    );
  }

  const messages = new Set(potentialExample.errors.map(e => e.message));

  return (
    <div>
      <ErrorHeading>An example could not be generated.</ErrorHeading>
      <Expand onOpen="(Collapse advanced view)" onClosed="(Expand advanced view)">
        <div>
          This example could not be automatically generated because:
          <ul>
            {Array.from(messages.values()).map(m => <li key={m}>{m}</li>)}
          </ul>
                    For more information please download the JSON Schema.
        </div>
      </Expand>
    </div>
  );
};

export type SchemaExplorerDetailsProps = {
  schema: JsonSchema1;
  reference: string;
  lookup: Lookup;
  stage: Stage;
  clickElement: ClickElement;
};

const DescriptionContainer = styled.div`
    margin-top: 8px;
    margin-bottom: 10px;
`;

function getDescriptionForSchema(schema: JsonSchema): string | undefined {
  if (typeof schema === 'boolean') {
    return schema ? 'Anything is allowed here.' : 'There is no valid value for this property.';
  }
  return schema.description;
}

export const SchemaExplorerDetails: React.FC<SchemaExplorerDetailsProps> = props => {
  const { schema, reference, clickElement, lookup, stage } = props;
  const properties = schema.properties || {};

  const renderedProps = Object.keys(properties)
    .map(propertyName => {
      const propertySchema = properties[propertyName];
      const lookupResult = lookup.getSchema(propertySchema);
      return ({
        propertyName,
        lookupResult,
        propertyReference: lookupResult?.baseReference || `${reference}/properties/${propertyName}`
      });
    })
    .filter(p => {
      if (p.lookupResult === undefined) {
        return true;
      }
      return shouldShowInStage(stage, p.lookupResult.schema);
    })
    .map(p => {
      const isRequired =
        typeof schema.required !== 'undefined' && !!schema.required.find(n => n === p.propertyName);

      if (p.lookupResult) {
        return (
          <ParameterView
            key={p.propertyName}
            name={p.propertyName}
            description={getDescriptionForSchema(p.lookupResult.schema)}
            required={isRequired}
            deprecated={false}
            schema={p.lookupResult.schema}
            reference={p.propertyReference}
            lookup={lookup}
            clickElement={clickElement}
          />
        );
      } else {
        return (
          <ParameterView
            key={p.propertyName}
            name={p.propertyName}
            description="Could not find schema for property. Defaulting to `anything`."
            required={isRequired}
            schema={undefined}
            reference={p.propertyReference}
            lookup={lookup}
            clickElement={clickElement}
          />
        );
      }
    });

  const additionalProperties = new Array<JSX.Element>();
  if (typeof schema.additionalProperties === 'boolean') {
    if (schema.additionalProperties) {
      additionalProperties.push((
        <ParameterView
          key="dac__schema-additional-properties"
          name="Additional Properties"
          description="Extra properties of any type may be provided to this object."
          required={false}
          schema={{}}
          reference={`${reference}/additionalProperties`}
          lookup={lookup}
          clickElement={clickElement}
        />
      ));
    }
  } else if (schema.additionalProperties !== undefined) {
    const additionalPropertiesResult = lookup.getSchema(schema.additionalProperties);
    if (additionalPropertiesResult !== undefined) {
      const resolvedReference = additionalPropertiesResult.baseReference || `${reference}/additionalProperties`;
      additionalProperties.push((
        <ParameterView
          key="dac__schema-additional-properties"
          name="Additional Properties"
          description={getDescriptionForSchema(additionalPropertiesResult)}
          required={false}
          schema={additionalPropertiesResult.schema}
          reference={resolvedReference}
          lookup={lookup}
          clickElement={clickElement}
        />
      ));
    }
  }

  const patternProperties = schema.patternProperties || {};
  const renderedPatternProperties = Object.keys(patternProperties).map((pattern, i) => {
    const lookupResult = lookup.getSchema(patternProperties[pattern]);
    return (
      <ParameterView
        key={`pattern-properties-${i}`}
        name={`/${pattern}/ (keys of pattern)`}
        description={getDescriptionForSchema(schema)}
        required={false}
        schema={getSchemaFromResult(lookupResult)}
        reference={lookupResult?.baseReference || `${reference}/patternProperties/${pattern}`}
        lookup={lookup}
        clickElement={clickElement}
      />
    )
  })
  if (schema.patternProperties !== undefined) {
    schema.patternProperties
  }

  return (
    <div>
      <DescriptionContainer>
        {schema.description && <Markdown source={schema.description} />}
      </DescriptionContainer>
      {renderedProps}
      {renderedPatternProperties.length > 0 && renderedPatternProperties}
      {additionalProperties}
    </div>
  );
};

type JsonSchemaObjectClickProps = {
  basePathSegments: Array<string>;
  path: Array<PathElement>;
};

function createClickElement(details: JsonSchemaObjectClickProps): ClickElement {
  return (props) => {
    const references = [...details.path.map(p => p.reference), props.reference];
    return <LinkPreservingSearch to={linkTo(details.basePathSegments, references)}>{getTitle(props.reference, props.schema)}</LinkPreservingSearch>;
  };
}

export type SchemaExplorerProps = {
  basePathSegments: Array<string>;
  path: PathElement[];
  schema: JsonSchema1;
  stage: Stage;
  lookup: Lookup;
};

export type SchemaExplorerState = {
  pathExpanded: boolean;
  view: 'details' | 'example';
};

export class SchemaExplorer extends React.PureComponent<SchemaExplorerProps, SchemaExplorerState> {
  private static Container = styled.section`
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 24px 20px;
        margin: 0;
        max-width: 100%;
    `;

  private static Heading = styled.h1`
        font-size: 16px;
        font-weight: 600;
        padding-top: 24px;
        margin: 5px 8px;
    `;

  UNSAFE_componentWillMount() {
    this.setState({
      pathExpanded: false,
      view: 'details'
    });
  }

  render() {
    const { path, schema, lookup, stage, basePathSegments } = this.props;
    const { pathExpanded } = this.state;
    if (path.length === 0) {
      return <div>TODO What do we do when the reference could not be found? Error maybe?</div>;
    }

    const currentPathElement = path[path.length - 1];

    const tabData: TabData[] = [{
      label: 'Details',
      content: (
        <SchemaExplorerDetails
          schema={schema}
          reference={currentPathElement.reference}
          lookup={lookup}
          stage={stage}
          clickElement={createClickElement({ basePathSegments, path })}
        />
      )
    }, {
      label: 'Example',
      content: (
        <SchemaExplorerExample schema={schema} lookup={lookup} stage={stage} />
      )
    }];

    const onTabSelect: OnSelectCallback = tab => {
      this.setState({
        view: tab.label === 'Details' ? 'details' : 'example'
      });
    };

    return (
      <SchemaExplorer.Container>
        <SEPHead
          basePathSegments={basePathSegments}
          path={path}
          pathExpanded={pathExpanded}
          onExpandClick={() => this.onExpandClick()}
        />
        <SchemaExplorer.Heading>{getTitle(currentPathElement.reference, schema)}</SchemaExplorer.Heading>
        <Tabs tabs={tabData} selected={this.state.view === 'details' ? 0 : 1} onSelect={onTabSelect} />
      </SchemaExplorer.Container>
    );
  }

  private onExpandClick(): void {
    this.setState({
      pathExpanded: true
    });
  }
}
