export type PathElement = {
  title: string;
  reference: string;
};

export function linkTo(basePathSegments: Array<string>, references: Array<string>): string {
  const firstSection = basePathSegments.length === 0 ? '/' : '/' + basePathSegments.join('/') + '/';
  return firstSection + references.map(ref => encodeURIComponent(ref)).join('/');
}

function linkToComponentInUrl(basePathSegments: Array<string>, component: string, url: string): string {
  return `${linkTo(basePathSegments, [component])}?url=${encodeURIComponent(url)}`;
}

export function linkToRoot(basePathSegments: Array<string>, url: string): string {
  return linkToComponentInUrl(basePathSegments, '#', url);
}

export function externalLinkTo(basePathSegments: Array<string>, externalRef: string): string | null {
  try {
    const parsedUrl = new URL(externalRef);

    // Do not rewrite the protocol (e.g. http -> https) of the external reference: the generated link must point at
    // the same URL as the $ref itself. Browsers may still block fetching an http: URL from an https: page as mixed
    // content, in which case the schema loader shows its regular load failure state. Silently switching the
    // protocol is surprising behaviour (see issue #34) and often points at a URL that does not exist at all.
    const pathSegment = parsedUrl.hash.startsWith('#') ? parsedUrl.hash : '#';
    parsedUrl.hash = '';
    const url = parsedUrl.toString();
    return linkToComponentInUrl(basePathSegments, pathSegment, url);
  } catch(e) {
    return null;
  }
}