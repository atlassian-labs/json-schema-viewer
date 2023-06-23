import React from 'react';
import OpenIcon from '@atlaskit/icon/glyph/open';
import { Components } from "react-markdown";

export const isExternalLink = (href: string): boolean => {
  return ![
    () => href.startsWith('/'),
    () => href.startsWith('.'),
    () => href.startsWith('#'),
  ].some(match => match());
};

export const LinkRenderer: Components['a'] = ({ href, children }) => {
  const isExternal = href ? isExternalLink(href) : false;

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : ''}
    >
      {children}
      {isExternal && <OpenIcon label="Follow" size="small" />}
    </a>
  );
};
