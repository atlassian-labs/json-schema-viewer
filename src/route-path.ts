export type PathElement = {
  title: string;
  reference: string;
};

export function linkTo(basePathSagments: Array<string>, references: Array<string>): string {
  const firstSection = basePathSagments.length === 0 ? '/' : '/' + basePathSagments.join('/') + '/';
  return firstSection + references.map(ref => encodeURIComponent(ref)).join('/');
}