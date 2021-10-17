import React from 'react';
import { Link, LinkProps, NavLink, NavLinkProps } from 'react-router-dom';
import H from 'history';

export type LinkPreservingSearchProps<S = H.LocationState> = Omit<LinkProps<S>, 'to'> & {
   to: string;
};

export const LinkPreservingSearch: React.FC<LinkPreservingSearchProps> = props => {
   const { to, ...remainder } = props;
   return (
      <Link {...remainder} to={currentLocation => ({ ...currentLocation, pathname: to })} />
   );
};

export type NavLinkPreservingSearchProps<S = H.LocationState> = Omit<NavLinkProps<S>, 'to'> & {
   to: string;
};

export const NavLinkPreservingSearch: React.FC<NavLinkPreservingSearchProps> = props => {
   const { to, ...remainder } = props;
   return (
      <NavLink {...remainder} to={currentLocation => ({ ...currentLocation, pathname: props.to })} />
   );
};