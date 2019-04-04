import * as React from "react";

import { Nav, NavItem, NavLink } from "reactstrap";

import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "./logo.png";
import logoMobile from "./logo--mobile.png";
export default class DefaultHeader extends React.Component<
  { onLogout: any, user: any | null },
  {}
> {
  render() {
    // eslint-disable-next-line
    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile={true} />
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: "BeatMods" }}
          minimized={{ src: logoMobile, width: 30, height: 30, alt: "BeatMods" }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        <Nav className="ml-auto" navbar={true}>
          {this.props.user && (<NavItem className="px-3">
            <NavLink onClick={this.props.onLogout}>Logout</NavLink>
          </NavItem>)}
          {!this.props.user && (<NavItem className="px-3">
            <NavLink href="/#/login">Login/Register</NavLink>
          </NavItem>)}
        </Nav>
      </React.Fragment>
    );
  }
}
