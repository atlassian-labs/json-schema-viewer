import React from 'react';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import styled from 'styled-components';
import { forSize } from './breakpoints';
import { NavLink } from 'react-router-dom';

export type SideNavLink = SingleSideNavLink | GroupSideNavLink;

export type SingleSideNavLink = {
   title: string;
   reference: string;
};

export type GroupSideNavLink = {
   title: string;
   reference: string;
   children: SingleSideNavLink[];
};

function isGroupSideNavLink(l: SideNavLink): l is GroupSideNavLink {
  return 'children' in l;
}

interface NavItemProps {
  indent?: boolean;
}

/*
${({ selected }) => `
        list-style-type: ${selected ? 'disc' : 'none'};
        color: ${selected ? '#0057d8' : 'rgb(37, 56, 88)'};
    `}
    */

const NavItem = styled<NavItemProps, 'li'>('li')`
    margin: 0;
    font-size: 11px;

    a {
        color: inherit;
        font-size: 14px;
        text-decoration: none;

        line-height: 18px;
        padding: ${({ indent }) => `0.7rem 1rem 0.22rem ${indent ? '13px' : 0}`};

        display: inline-flex;
        display: -moz-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    a:focus {
        outline: none;
    }

    a.active {
      color: #0057d8;
    }
`;

type SideNavGroupProps = {
  basePath: string;
  link: SideNavLink;
};

type SideNavGroupState = {
  open: boolean;
  lastOpenReference: string | undefined;
};

class SideNavGroup extends React.PureComponent<SideNavGroupProps, SideNavGroupState> {
  private static Item = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;

    a {
        color: rgb(37, 56, 88);
    }

    a.active {
      color: #0057d8;
    }
  `;

  private static SubItemContainer = styled.ul`
    margin: 0px;
    padding: 0 0 0 32px;
  `;

  private static IconWrap = styled.span`
    cursor: pointer;
  `;

  private static SingleLinkContainer = styled.div`
    line-height: 27px;
    padding-left: 24px;
    margin: 0;
  `;

  UNSAFE_componentWillMount() {
    this.setState({
      open: false
    });
  }

  render() {
    const { basePath, link } = this.props;
    const { open } = this.state;

    if (!isGroupSideNavLink(link) || link.children.length === 0) {
      return (
        <div>
          <SideNavGroup.Item>
            <SideNavGroup.SingleLinkContainer>
              <NavLink to={`${basePath}/${encodeURIComponent(link.reference)}`}>
                {link.title}
              </NavLink>
            </SideNavGroup.SingleLinkContainer>
          </SideNavGroup.Item>
        </div>
      );
    }

    const subLinks = !isGroupSideNavLink(link) ? [] : link.children.map(childLink => {
      return (
        <NavItem key={childLink.reference} indent={true}>
          <NavLink to={`${basePath}/${encodeURIComponent(childLink.reference)}`} >
            {childLink.title}
          </NavLink>
        </NavItem>
      );
    });

    const icon = open
      ? (
        <ChevronDownIcon label="Open" />
      )
      : (
        <ChevronRightIcon label="Closed" />
      );

    return (
      <div>
        <SideNavGroup.Item>
          <SideNavGroup.IconWrap onClick={() => this.toggleState(!open)}>{icon}</SideNavGroup.IconWrap>
          <NavLink to={`${basePath}/${encodeURIComponent(link.reference)}`}>
            {link.title}
          </NavLink>
        </SideNavGroup.Item>
        {open && <SideNavGroup.SubItemContainer>{subLinks}</SideNavGroup.SubItemContainer>}
      </div>
    );
  }

  private toggleState(open: boolean): void {
    // Change the state
    this.setState({
      open
    });
  }
}

type SideNavLinksProps = {
  basePath: string;
  links: Array<SideNavLink>
};

class SideNavLinks extends React.PureComponent<SideNavLinksProps, SideNavState> {
  private static WrappedHotKeys = styled.div`
      display: none;
      ${forSize('tablet-landscape-up', `
         display: block;
         flex: auto;
         overflow-y: auto;
      `)}
      &:focus {
         outline: 0;
      }
    `;

  UNSAFE_componentWillMount() {
    this.setState({});
  }

  render() {
    const { basePath, links } = this.props;
    const { selectedReference } = this.state;

    const groups = links.map(link => {
      return <SideNavGroup basePath={basePath} key={link.title} link={link} />
    });

    return (
      <SideNavLinks.WrappedHotKeys>
        <div>{groups}</div>
      </SideNavLinks.WrappedHotKeys>
    );
  }
}

// We also need to think about how scroll position affects this component
// We also need to think about section rendering
export type SideNavWithRouterProps = {
  basePath: string;
  links: Array<SideNavLink>
};

export type SideNavState = {
  selectedReference: string | undefined;
};

export class SideNavWithRouter extends React.PureComponent<SideNavWithRouterProps> {
  private static Container = styled.div`
        display: flex;
        flex-direction: column;

        ${forSize('tablet-landscape-up', `
            height: 95vh;
            width: 300px;
        `)}
    `;

  private static Actions = styled.div`
        flex: initial;
        margin: 0 0 0 0;

        padding: 0 20px 0 8px;
    `;

  render() {
    const { basePath, links } = this.props;

    return (
      <SideNavWithRouter.Container>
        <SideNavLinks basePath={basePath} links={links} />
      </SideNavWithRouter.Container>
    );
  }
}