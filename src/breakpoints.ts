import { assertExhaustive } from './exhaustiveness-assertion';

export type BreakpointSize =
  'phone-only' |
  'tablet-portrait-up' |
  'tablet-landscape-up' |
  'desktop-up' |
  'big-desktop-up';

export function forSize(size: BreakpointSize, content: string): string {
  switch (size) {
    case 'phone-only':
      return `@media (max-width: 599px) { ${content} }`;
    case 'tablet-portrait-up':
      return `@media (min-width: 600px) { ${content} }`;
    case 'tablet-landscape-up':
      return `@media (min-width: 900px) { ${content} }`;
    case 'desktop-up':
      return `@media (min-width: 1200px) { ${content} }`;
    case 'big-desktop-up':
      return `@media (min-width: 1800px) { ${content} }`;
    default:
      assertExhaustive(size);
      return '';
  }
}