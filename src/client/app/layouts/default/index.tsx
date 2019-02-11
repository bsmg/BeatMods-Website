import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import {
  AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav
} from "@coreui/react";
// sidebar nav config
import navigation from "../../_nav";
// routes config
import routes from "../../routes";
import axios from "axios";
const DefaultFooter = React.lazy(() => import("./footer"));
const DefaultHeader = React.lazy(() => import("./header"));

class DefaultLayout extends React.Component<{ history: any }, {}> {
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  );

  async signOut(e) {
    e.preventDefault();
    const {status} = await axios({
      method: "post",
      url: "/api/v1/signOut"
    });
    if (status == 200) {
      this.props.history.push("/login");
    }
  }

  render() {
    return (
      <div className="app">
        <AppHeader fixed={true}>
          <React.Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} />
          </React.Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed={true} display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <React.Suspense fallback={this.loading()}>
              <AppSidebarNav navConfig={navigation} {...this.props} />
            </React.Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes} />
            <Container fluid={true}>
              <React.Suspense fallback={this.loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        render={props => <route.component {...props} />}
                      />
                    ) : null;
                  })}
                </Switch>
              </React.Suspense>
            </Container>
          </main>
        </div>
        <AppFooter>
          <React.Suspense fallback={this.loading()}>
            <DefaultFooter />
          </React.Suspense>
        </AppFooter>
      </div>
    );
  }
}

export default DefaultLayout;
