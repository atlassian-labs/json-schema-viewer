import React, { FC } from 'react';
import type { editor, IRange } from 'monaco-editor';
import { colors } from '@atlaskit/theme';
import IconError from '@atlaskit/icon/glyph/error';
import IconInfo from '@atlaskit/icon/glyph/info';
import IconWarning from '@atlaskit/icon/glyph/warning';
import Table, { Cell, Row, SortableColumn, TBody, THead } from '@atlaskit/table';
import styled from 'styled-components';
import { MarkerSeverity } from './monaco-helpers';

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
  return (
    <Table>
      <THead>
        <SortableColumn name="severity">Severity</SortableColumn>
        <SortableColumn name="message">Message</SortableColumn>
        <SortableColumn name="startLineNumber">Location</SortableColumn>
      </THead>
      <TBody rows={results}>
        {(row) => {
          const { label, icon: Icon, color } = severityDefinitions[row.severity];
          const {
            modelVersionId,
            message,
            startColumn,
            startLineNumber,
            endColumn,
            endLineNumber,
          } = row;
          return (
            <Row key={modelVersionId}>
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
                  {startLineNumber}:{startColumn}-{endLineNumber}:{endColumn}
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
