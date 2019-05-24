import * as React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import "./App.scss";
import Loadable from "react-loadable";
import routes from "../routes";

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;
const DefaultLayout = Loadable({
    loader: () => import("../layouts/default"),
    loading
});

const Login = Loadable({
    loader: () => import("../views/pages/Login"),
    loading
});
const Register = Loadable({
    loader: () => import("../views/pages/Register"),
    loading
});
const NotFound = Loadable({
    loader: () => import("../views/pages/NotFound"),
    loading
});

export default class App extends React.Component<{}, {}> {
    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route path="/" name="Home" component={RoutedComponents} />
                </Switch>
            </HashRouter>
        );
    }
}

// Make sure only existing routes are rendered in the default layout
const defaultLayoutPath = "/(" + routes.map(route => route.path.substring(1)).join("|") + ")/";

class RoutedComponents extends React.Component<{ history?: any }, {}> {
    render() {
        return (
            <Switch>
                <Route exact={true} path="/register" name="Register Page" component={Register} />
                <Route exact={true} path="/login" name="Login Page" component={Login} />
                <Route exact={true} path={defaultLayoutPath} name="Home" component={DefaultLayout} />
                <Route component={NotFound} />
            </Switch>
        );
    }
}
