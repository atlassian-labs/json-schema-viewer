import { Lookup } from "./lookup";
import { JsonSchema } from "./schema";
import { GroupSideNavLink, SideNavLink, SingleSideNavLink, Spacer } from "./SideNavWithRouter";
import { getTitle } from "./title";

export function extractLinks(schema: JsonSchema, lookup: Lookup): Array<SideNavLink> {
  const links = new Array<SideNavLink>();

  if (typeof schema === 'boolean') {
    return [{
      title: 'Root',
      reference: '#'
    }];
  }

  links.push({
    title: getTitle('#', schema),
    reference: '#'
  });
  links.push(Spacer);

  if (schema.definitions !== undefined) {
    const children = new Array<SingleSideNavLink>();
    for (const key in schema.definitions) {
      if (Object.prototype.hasOwnProperty.call(schema.definitions, key)) {
        const definition = schema.definitions[key];
        const reference = `#/definitions/${key}`;

        children.push({
          title: typeof definition === 'boolean' ? key : getTitle(reference, definition),
          reference
        });
      }
    }

    const topDefinitionsGroup: GroupSideNavLink = {
      title: 'Root definitions',
      reference: undefined,
      children
    };

    links.push(topDefinitionsGroup);
  }

  return links;
}