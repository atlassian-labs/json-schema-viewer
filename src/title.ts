import { JsonSchema1 } from "./schema";

export function getTitle(reference: string, schema: JsonSchema1): string {
  if (schema.title !== undefined) {
    return schema.title;
  }

  const rs = reference.split('/');
  const last = rs[rs.length - 1];
  const secondLast = rs[rs.length - 2];
  if (['properties', 'definitions'].includes(secondLast)) {
    return last;
  } else if (last === 'additionalProperties') {
    return '(Additional properties)';
  }

  return 'object';
}