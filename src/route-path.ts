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

    if (parsedUrl.protocol === 'http:') {
      // In production, since we host on https, without this you would get mixed content errors when attempting to
      // fetch. This may be surprising behaviour.
      parsedUrl.protocol = 'https:';
    }

    const pathSegment = parsedUrl.hash.startsWith('#') ? parsedUrl.hash : '#';
    parsedUrl.hash = '';
    const url = parsedUrl.toString();
    return linkToComponentInUrl(basePathSegments, pathSegment, url);
  } catch(e) {
    return null;
  }
}