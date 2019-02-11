import * as React from "react";

import { Nav, NavItem, NavLink } from "reactstrap";

import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";

export default class DefaultHeader extends React.Component<
  { onLogout: any },
  {}
> {
  render() {
    // eslint-disable-next-line
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile={true} />
        <AppNavbarBrand
          full={{ src: "", width: 89, height: 25, alt: "Logo" }}
          minimized={{ src: "", width: 30, height: 30, alt: "Logo" }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        <Nav className="d-md-down-none" navbar={true}>
          <NavItem className="px-3">
            <NavLink href="/">Homepage</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <NavLink onClick={this.props.onLogout}>Logout</NavLink>
          </NavItem>
        </Nav>
        <Nav className="ml-auto" navbar={true} />
      </React.Fragment>
    );
  }
}
