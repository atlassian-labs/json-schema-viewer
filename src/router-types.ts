import type { Location } from 'react-router-dom';

/** The portion of a router location used by route-aware class components. */
export type RouteLocation = Pick<Location, 'pathname' | 'search'> &
  Partial<Pick<Location, 'hash' | 'state'>>;
