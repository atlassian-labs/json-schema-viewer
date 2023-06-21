import React, { useEffect } from 'react';
import { JsonSchema } from './schema';
import Editor, { OnValidate, useMonaco } from '@monaco-editor/react';
import type { IRange } from 'monaco-editor';
import { ScrollType } from './monaco-helpers';

export type SchemaEditorProps = {
  initialContent: unknown;
  schema: JsonSchema;
  validationRange?: IRange;
  onValidate: OnValidate;
};

/**
 * No more than 50 characters per line.
 */
const editorPreamble = `
// Copy-and-paste your JSON in here to live-edit
// while reading the docs and also getting the
// benefit of validation and autocompletion!
`.trim();

export const SchemaEditor: React.FC<SchemaEditorProps> = (props) => {
  const { initialContent, schema, validationRange, onValidate } = props;
  const monaco = useMonaco();

  useEffect(() => {
    monaco?.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: 'https://json-schema.app/example.json', // id of the first schema
          fileMatch: ['a://b/example.json'],
          schema: schema,
        },
      ],
    });
  }, [monaco, schema]);
  useEffect(() => {
    if (!validationRange || !monaco) {
      return;
    }
    monaco.editor.getEditors().forEach((codeEditor) => {
      codeEditor.setSelection(validationRange);
      codeEditor.revealRangeAtTop(validationRange, ScrollType.Smooth);
    });
  }, [monaco, validationRange]);

  return (
    <Editor
      height="97vh"
      defaultLanguage="json"
      value={editorPreamble + '\n' + JSON.stringify(initialContent, null, 2)}
      path="a://b/example.json"
      theme="vs-dark"
      saveViewState={false}
      onValidate={onValidate}
    />
  );
};
