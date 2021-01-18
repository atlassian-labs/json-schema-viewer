import React, { ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { JsonSchema } from './schema';
import Spinner from '@atlaskit/spinner';
import EmptyState from '@atlaskit/empty-state';

export type LoadSchemaProps = RouteComponentProps & {
   children: (schema: JsonSchema) => ReactNode;
};

export type LoadSchemaError = {
   message: string;
};

export type LoadSchemaState = {
   schema?: JsonSchema | LoadSchemaError;
};

function isLoadSchemaError(e: JsonSchema | LoadSchemaError): e is LoadSchemaError {
   return typeof e !== 'boolean' && 'message' in e;
}

class LoadSchemaWR extends React.PureComponent<LoadSchemaProps, LoadSchemaState> {
   state: LoadSchemaState = {

   };

   componentDidMount() {
      const urlToFetch = new URLSearchParams(this.props.location.search);
      const url = urlToFetch.get('url') ;
      if (url) {
         fetch(url)
            .then(resp => resp.json())
            .then(result => this.setState({ schema: result }))
            .catch(e => this.setState({ schema: { message: e.message }}));
      }
   }

   render() {
      const { schema } = this.state;
      if (schema === undefined) {
         return (
            <EmptyState
               header="Loading schema..."
               description="Attempting to pull the JSON Schema down from the public internet."
               primaryAction={(
                  <Spinner size="xlarge" />
               )}
            />
         );
      }

      if (isLoadSchemaError(schema)) {
         return (
            <EmptyState
               header="Schema load failed"
               description="Attempted to pull the JSON Schema down from the public internet."
               primaryAction={(
                  <p>Error: ${schema.message}</p>
               )}
            />
         );
      }

      const { children } = this.props;
      if (typeof children !== 'function') {
         throw new Error('The children of the LoadSchema must be a function to accept the schema.')
      }
      return <>{children(schema)}</>;
   }
}

export const LoadSchema = withRouter<LoadSchemaProps, typeof LoadSchemaWR>(LoadSchemaWR);