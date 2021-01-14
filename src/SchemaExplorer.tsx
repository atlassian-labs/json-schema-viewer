import React from 'react';
import { JsonSchema, JsonSchema1 } from './schema';
import { Lookup } from './lookup';
import { ParameterView } from './Parameter';
import styled from 'styled-components';
import Button from '@atlaskit/button';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import ChevronLeftIcon from '@atlaskit/icon/glyph/chevron-left';
import { Markdown } from './markdown';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Tabs from '@atlaskit/tabs';
import { TabData, OnSelectCallback } from '@atlaskit/tabs/types';
import { CodeBlockWithCopy } from './code-block-with-copy';
import { generateJsonExampleFor, isExample, Example, Errors } from './example';
import { Stage, shouldShowInStage } from './stage';

interface SEPHeadProps {
  path: PathElement[];
  pathExpanded: boolean;
  setPath: (path: PathElement[]) => void;
  onClose: () => void;
  onBackClick: () => void;
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

function getObjectPath(
  path: PathElement[],
  setPath: (path: PathElement[]) => void,
  onClick: (title: string) => void): JSX.Element[] {
  return path.map((pe, i) => (
    <BreadcrumbsItem
      key={`${pe.title}-${i}`}
      text={pe.title}
      onClick={e => {
        e.preventDefault();
        setPath(path.slice(0, i + 1));
        onClick(pe.title);
      }}
    />
  ));
}

const SEPHead = (props: SEPHeadProps) => {
  const onBackClick = (_e: React.MouseEvent<HTMLElement>) => {
    props.onBackClick();
  };

  const onClose = (_e: React.MouseEvent<HTMLElement>) => {
    props.onClose();
  };

  const onExpandClick = () => {
    props.onExpandClick();
  };

  const onPathClick = (title: string) => {
  };

  const ActionButton = props.path.length <= 1
    ? <Button iconBefore={<CrossIcon label="Close" />} onClick={onClose}>Close</Button>
    : (
      <Button
        key="backButton"
        iconBefore={<ChevronLeftIcon label="Back" />}
        onClick={onBackClick}
      >Back
      </Button>
    );

  return (
    <Head>
      <div>{ActionButton}</div>
      <Path>
        <BreadcrumbsStateless
          isExpanded={props.pathExpanded}
          onExpand={onExpandClick}
        >
          {getObjectPath(props.path, props.setPath, onPathClick)}
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
  lookup: Lookup;
  stage: Stage;
  onClickType: (propertyName: string, schema: JsonSchema1) => void;
};

const DescriptionContainer = styled.div`
    margin-top: 8px;
    margin-bottom: 10px;
`;

function getDescriptionForSchema(schema: JsonSchema): string | undefined {
  if (typeof schema == 'boolean') {
    return schema ? 'Anything is allowed here.' : 'There is no valid value for this property.';
  }
  return schema.description;
}

export const SchemaExplorerDetails: React.FC<SchemaExplorerDetailsProps> = props => {
  const { schema, onClickType, lookup, stage } = props;
  const properties = schema.properties || {};

  const renderedProps = Object.keys(properties)
    .map(propertyName => {
      const propertySchema = properties[propertyName];
      return ({
        propertyName,
        schema: lookup.getSchema(propertySchema)
      });
    })
    .filter(p => {
      if (typeof p.schema === 'undefined') {
        return true;
      }
      return shouldShowInStage(stage, p.schema);
    })
    .map(p => {
      const isRequired =
        typeof schema.required !== 'undefined' && !!schema.required.find(n => n === p.propertyName);

      if (p.schema) {
        return (
          <ParameterView
            key={p.propertyName}
            name={p.propertyName}
            description={getDescriptionForSchema(p.schema)}
            required={isRequired}
            deprecated={false}
            schema={p.schema}
            lookup={lookup}
            onClickType={s => typeof s !== 'boolean' && onClickType(p.propertyName, s)}
          />
        );
      } else {
        return (
          <ParameterView
            key={p.propertyName}
            name={p.propertyName}
            description="Could not find schema for property. Defaulting to `anything`."
            required={isRequired}
            schema={p.schema}
            lookup={lookup}
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
          lookup={lookup}
        />
      ));
    }
  } else if (schema.additionalProperties !== undefined) {
    const additionalPropertiesSchema = lookup.getSchema(schema.additionalProperties);
    if (additionalPropertiesSchema !== undefined) {
      additionalProperties.push((
        <ParameterView
          key="dac__schema-additional-properties"
          name="Additional Properties"
          description={getDescriptionForSchema(additionalPropertiesSchema)}
          required={false}
          schema={additionalPropertiesSchema}
          lookup={lookup}
          onClickType={s => typeof s !== 'boolean' && onClickType('(Additional properties)', s)}
        />
      ));
    }
  }

  return (
    <div>
      <DescriptionContainer>
        {schema.description && <Markdown source={schema.description} />}
      </DescriptionContainer>
      {renderedProps}
      {additionalProperties}
    </div>
  );
};

export type SchemaExplorerProps = {
  schema: JsonSchema1;
  stage: Stage;
  lookup: Lookup;
  onClose: () => void;
};

export type SchemaExplorerState = {
  /**
     * We always render the latest element in the list.
     */
  path: PathElement[];
  pathExpanded: boolean;
  view: 'details' | 'example';
};

export type PathElement = {
  title: string;
  schema: JsonSchema1;
};

export class SchemaExplorer extends React.PureComponent<SchemaExplorerProps, SchemaExplorerState> {
  private static Container = styled.section`
        display: flex;
        flex-direction: column;
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

  private static getTitle(s: JsonSchema1): string {
    return s.title !== undefined ? s.title : 'object';
  }

  UNSAFE_componentWillMount() {
    const { schema } = this.props;

    const path: PathElement[] = [{
      title: '#',
      schema
    }];

    this.setState({
      path,
      pathExpanded: false,
      view: 'details'
    });
  }

  render() {
    const { lookup, stage } = this.props;
    const { path, pathExpanded } = this.state;
    if (path.length === 0) {
      return <div>TODO What do we do when the reference could not be found? Error maybe?</div>;
    }
    const pe = path[path.length - 1];
    const schema = pe.schema;

    const componentPath = path.map(p => p.title).join('.');

    const onClick = (propertyName: string, cSchema: JsonSchema1) => {
      this.setState(s => ({
        path: [...s.path, {
          title: propertyName,
          schema: cSchema
        }]
      }));
    };

    const tabData: TabData[] = [{
      label: 'Details',
      content: (
        <SchemaExplorerDetails
          schema={schema}
          lookup={lookup}
          stage={stage}
          onClickType={onClick}
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
          path={path}
          pathExpanded={pathExpanded}
          setPath={p => this.setPath(p)}
          onClose={() => this.props.onClose()}
          onBackClick={() => this.onBackClick()}
          onExpandClick={() => this.onExpandClick()}
        />
        <SchemaExplorer.Heading>{SchemaExplorer.getTitle(schema)}</SchemaExplorer.Heading>
        <Tabs tabs={tabData} selected={this.state.view === 'details' ? 0 : 1} onSelect={onTabSelect} />
      </SchemaExplorer.Container>
    );
  }

  private onExpandClick(): void {
    this.setState({
      pathExpanded: true
    });
  }

  private setPath(path: PathElement[]) {
    this.setState({ path });
  }

  private onBackClick(): void {
    this.setState(s => ({
      path: s.path.slice(0, s.path.length - 1)
    }));
  }
}
