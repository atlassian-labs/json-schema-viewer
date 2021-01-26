import React, { useEffect } from 'react';
import { JsonSchema } from './schema';
import Editor, { useMonaco } from "@monaco-editor/react";

export type SchemaEditorProps = {
   initialContent: unknown;
   schema: JsonSchema;
}

export const SchemaEditor: React.FC<SchemaEditorProps> = (props) => {
   const monaco = useMonaco();

   useEffect(() => {
      monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
         validate: true,
         schemas: [{
             uri: "https://json-schema.app/example.json", // id of the first schema
             fileMatch: ['a://b/example.json'],
             schema: props.schema
         }]
     });
   }, [monaco, props.schema]);

   return (
      <Editor
         height="100vh"
         defaultLanguage="json"
         value={JSON.stringify(props.initialContent, null, 2)}
         path="a://b/example.json"
         theme="vs-dark"
         saveViewState={false}
      />
   );
};