import React from 'react';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import styled from 'styled-components';
import { forSize } from './breakpoints';
import { NavLink } from 'react-router-dom';
import { linkTo } from './route-path';

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
  basePathSagments: Array<string>;
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
    const { basePathSagments, link } = this.props;
    const { open } = this.state;

    if (!isGroupSideNavLink(link) || link.children.length === 0) {
      return (
        <div>
          <SideNavGroup.Item>
            <SideNavGroup.SingleLinkContainer>
              <NavLink to={linkTo(basePathSagments, [link.reference])}>
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
          <NavLink to={linkTo(basePathSagments, [childLink.reference])} >
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
          <NavLink to={linkTo(basePathSagments, [link.reference])}>
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
  basePathSegments: Array<string>;
  links: Array<SideNavLink>
};

class SideNavLinks extends React.PureComponent<SideNavLinksProps> {
  private static Container = styled.div`
    display: none;
    ${forSize('tablet-landscape-up', `
      display: block;
      flex: auto;
      overflow-y: auto;
      min-width: 300px;

    `)}
    &:focus {
      outline: 0;
    }
  `;

  render() {
    const { basePathSegments, links } = this.props;

    const groups = links.map(link => {
      return <SideNavGroup basePathSagments={basePathSegments} key={link.title} link={link} />
    });

    return (
      <SideNavLinks.Container>
        <div>{groups}</div>
      </SideNavLinks.Container>
    );
  }
}

export type SideNavWithRouterProps = {
  basePathSegments: Array<string>;
  links: Array<SideNavLink>
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

  render() {
    const { basePathSegments, links } = this.props;

    return (
      <SideNavWithRouter.Container>
        <SideNavLinks basePathSegments={basePathSegments} links={links} />
      </SideNavWithRouter.Container>
    );
  }
}