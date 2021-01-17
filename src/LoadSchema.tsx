import React, { ReactNode } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { JsonSchema } from './schema';

export type LoadSchemaProps = RouteComponentProps & {
   children: (schema: JsonSchema) => ReactNode;
};

export type LoadSchemaState = {
   schema?: JsonSchema;
};

class LoadSchemaWR extends React.PureComponent<LoadSchemaProps, LoadSchemaState> {
   state: LoadSchemaState = {

   };

   componentDidMount() {
      const urlToFetch = new URLSearchParams(this.props.location.search);
      const url = urlToFetch.get('url') ;
      if (url) {
         fetch(url)
            .then(resp => resp.json())
            .then(result => this.setState({ schema: result }));
      }
   }

   render() {
      const { schema } = this.state;
      if (schema === undefined) {
         return <>Show loading screen...</>
      }

      const { children } = this.props;
      if (typeof children !== 'function') {
         throw new Error('The children of the LoadSchema must be a function to accept the schema.')
      }
      return <>{children(schema)}</>;
   }
}

export const LoadSchema = withRouter<LoadSchemaProps, typeof LoadSchemaWR>(LoadSchemaWR);