import React, { ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { JsonSchema } from './schema';
import Spinner from '@atlaskit/spinner';
import EmptyState from '@atlaskit/empty-state';
import { addRecentlyViewedLink } from './recently-viewed';

export type LoadSchemaProps = RouteComponentProps & {
   children: (schema: JsonSchema) => ReactNode;
};

export type LoadSchemaError = {
   message: string;
};

export type LoadSchemaState = {
   result?: ResultState;
};

export type ResultState = {
   currentUrl: string;
   schema: JsonSchema | LoadSchemaError;
}

function isLoadSchemaError(e: JsonSchema | LoadSchemaError): e is LoadSchemaError {
   return typeof e !== 'boolean' && 'message' in e;
}

class LoadSchemaWR extends React.PureComponent<LoadSchemaProps, LoadSchemaState> {
   state: LoadSchemaState = {

   };

   componentDidUpdate(prevProps: LoadSchemaProps, prevState: LoadSchemaState) {
      const url = this.getUrlFromProps();
      if (prevState.result !== undefined && prevState.result.currentUrl !== url && url !== null) {
         this.loadUrl(url);
      }
   }

   componentDidMount() {
      const url = this.getUrlFromProps();
      if (url !== null) {
         this.loadUrl(url);
      }
   }

   private getUrlFromProps(): string | null {
      const urlToFetch = new URLSearchParams(this.props.location.search);
      return urlToFetch.get('url') ;
   }

   private loadUrl(url: string): void {
      fetch(url)
         .then(resp => resp.json())
         .then(schema => this.setState({ result: { schema, currentUrl: url } }))
         .catch(e => this.setState({ result: { currentUrl: url, schema: { message: e.message }}}));
   }

   render() {
      const { result } = this.state;
      if (result === undefined) {
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

      if (isLoadSchemaError(result.schema)) {
         return (
            <EmptyState
               header="Schema load failed"
               description="Attempted to pull the JSON Schema down from the public internet."
               primaryAction={(
                  <p>Error: {result.schema.message}</p>
               )}
            />
         );
      }

      const { children } = this.props;
      if (typeof children !== 'function') {
         throw new Error('The children of the LoadSchema must be a function to accept the schema.')
      }
      const linkTitle = typeof result.schema !== 'boolean' ? result.schema.title || result.currentUrl : result.currentUrl;
      addRecentlyViewedLink({
         title: linkTitle,
         url: result.currentUrl
      });
      return <>{children(result.schema)}</>;
   }
}

export const LoadSchema = withRouter<LoadSchemaProps, typeof LoadSchemaWR>(LoadSchemaWR);
