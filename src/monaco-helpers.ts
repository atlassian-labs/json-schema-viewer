/* We need to import directly from these files to bypass Webpack parse issues */
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
export { MarkerSeverity } from 'monaco-editor/esm/vs/editor/editor.api';

export const ScrollType = editor.ScrollType;
