import React, { useEffect } from 'react';
import { MemoryRouter, MemoryRouterProps, useLocation, useNavigationType } from 'react-router-dom';

const NavigationLogger: React.FC = () => {
  const location = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`);
    console.log(`The last navigation action was ${action}`, JSON.stringify(location, null, 2));
  }, [action, location]);

  return null;
};

export const DebuggingMemoryRouter: React.FC<MemoryRouterProps> = props => (
  <MemoryRouter {...props}>
    <NavigationLogger />
    {props.children}
  </MemoryRouter>
);
