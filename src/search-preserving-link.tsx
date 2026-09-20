import React from 'react';
import { Link, LinkProps, NavLink, NavLinkProps, useLocation } from 'react-router-dom';

export type LinkPreservingSearchProps = Omit<LinkProps, 'to'> & {
   to: string;
};

export const LinkPreservingSearch: React.FC<LinkPreservingSearchProps> = props => {
   const { to, ...remainder } = props;
   const location = useLocation();
   return (
      <Link {...remainder} to={{ pathname: to, search: location.search, hash: location.hash }} />
   );
};

export type NavLinkPreservingSearchProps = Omit<NavLinkProps, 'to'> & {
   to: string;
};

export const NavLinkPreservingSearch: React.FC<NavLinkPreservingSearchProps> = props => {
   const { to, ...remainder } = props;
   const location = useLocation();
   return (
      <NavLink {...remainder} to={{ pathname: to, search: location.search, hash: location.hash }} />
   );
};
