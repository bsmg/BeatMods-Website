import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import { AppBreadcrumb, AppFooter, AppHeader, AppSidebar, AppSidebarFooter, AppSidebarForm, AppSidebarHeader, AppSidebarMinimizer, AppSidebarNav } from "@coreui/react";
// sidebar nav config
import navigation from "../../_nav";
// routes config
import routes from "../../routes";
import axios from "axios";
const DefaultFooter = React.lazy(() => import("./footer"));
const DefaultHeader = React.lazy(() => import("./header"));

class DefaultLayout extends React.Component<{ history: any }, { user: any | null }> {
    loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;
    async componentDidMount() {
        try {
            const { data } = await axios({
                method: "get",
                url: "/api/v1/user/current"
            });
            this.setState({ user: Object.keys(data).length ? data : null });
        } catch (e) {
            this.setState({ user: null });
        }

        if (window.location.hash !== "#/mods") {
            this.props.history.push("/mods");
        }
    }

    async signOut(e) {
        e.preventDefault();
        const { status } = await axios({
            method: "post",
            url: "/api/v1/signOut"
        });
        if (status === 200) {
            this.props.history.push("/login");
        }
    }

    render() {
        return (
            <div className="app">
                <AppHeader fixed={true}>
                    <React.Suspense fallback={this.loading()}>
                        <DefaultHeader onLogout={e => this.signOut(e)} user={this.state && this.state.user ? this.state.user : null} />
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
                                                render={props => <route.component {...props} user={this.state && this.state.user ? this.state.user : null} />}
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
