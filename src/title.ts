import { JsonSchema1 } from "./schema";

export function getTitle(reference: string, schema: JsonSchema1): string {
  if (schema.title !== undefined) {
    return schema.title;
  }

  const rs = reference.split('/');
  const last = rs[rs.length - 1];
  const secondLast = rs[rs.length - 2];
  const thirdLast = rs[rs.length - 3];
  if (['properties', 'definitions'].includes(secondLast)) {
    return last;
  } else if (last === 'additionalProperties') {
    return '(Additional properties)';
  } else if (last === 'items' && ['properties', 'definitions'].includes(thirdLast)) {
    return secondLast + ' items';
  }

  return 'object';
}