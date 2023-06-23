import React, { FC } from 'react';
import type { editor, IRange } from 'monaco-editor';
import { colors } from '@atlaskit/theme';
import IconError from '@atlaskit/icon/glyph/error';
import IconInfo from '@atlaskit/icon/glyph/info';
import IconWarning from '@atlaskit/icon/glyph/warning';
import Table, { Cell, Row, SortableColumn, TBody, THead } from '@atlaskit/table';
import styled from 'styled-components';
import { MarkerSeverity } from './monaco-helpers';
import EmptyState from "@atlaskit/empty-state";
import EditorSuccessIcon from "@atlaskit/icon/glyph/editor/success";

type SchemaValidatorProps = {
  results: editor.IMarker[];
  onSelectRange: (range: IRange) => void;
};

const severityDefinitions = {
  [MarkerSeverity.Error]: {
    label: 'Error',
    icon: IconError,
    color: colors.R500,
  },
  [MarkerSeverity.Warning]: {
    label: 'Warning',
    icon: IconWarning,
    color: colors.Y300,
  },
  [MarkerSeverity.Info]: {
    label: 'Info',
    icon: IconInfo,
    color: colors.B300,
  },
  [MarkerSeverity.Hint]: {
    label: 'Hint',
    icon: IconInfo,
    color: colors.B300,
  },
};

export const SchemaValidator: FC<SchemaValidatorProps> = ({ results, onSelectRange }) => {
  if (results.length === 0) {
    return (
      <EmptyState
        header="No validation issues!"
        renderImage={() => <EditorSuccessIcon size="xlarge" label="Success" primaryColor={colors.G300} />}
      />
    );
  }
  const sortedByLineNumber = results.sort((a, b) => {
    if (a.startLineNumber !== b.startLineNumber) {
      return a.startLineNumber - b.startLineNumber;
    }
    return a.startColumn - b.startColumn;
  });
  return (
    <Table>
      <THead>
        <SortableColumn name="severity">Severity</SortableColumn>
        <SortableColumn name="message">Message</SortableColumn>
        <SortableColumn name="startLineNumber">Location</SortableColumn>
      </THead>
      <TBody rows={sortedByLineNumber}>
        {(row) => {
          const { label, icon: Icon, color } = severityDefinitions[row.severity];
          const {
            message,
            startColumn,
            startLineNumber,
            endColumn,
            endLineNumber,
          } = row;
          const locationString = `${startLineNumber}:${startColumn}-${endLineNumber}:${endColumn}`
          return (
            <Row key={`${locationString}-${message}`}>
              <Cell>
                <Flex>
                  <Icon label={label} primaryColor={color} />
                  <span>{label}</span>
                </Flex>
              </Cell>
              <Cell>{message}</Cell>
              <Cell>
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault()
                    onSelectRange({
                      startColumn,
                      startLineNumber,
                      endColumn,
                      endLineNumber,
                    });
                  }}
                >
                  {locationString}
                </a>
              </Cell>
            </Row>
          );
        }}
      </TBody>
    </Table>
  );
};

const Flex = styled.div`
  display: flex;
  align-items: center;
`;
