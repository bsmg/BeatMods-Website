import * as React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.scss";
import Loadable from "react-loadable";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);
const DefaultLayout = Loadable({
  loader: () => import("../layouts/default"),
  loading
});

const Login = Loadable({
  loader: () => import('../views/Pages/Login'),
  loading
});
const Register = Loadable({
  loader: () => import('../views/Pages/Register'),
  loading
});


export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/register" name="Register Page" component={Register} />
          <Route exact path="/login" name="Login Page" component={Login} />
          <Route path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </BrowserRouter>
    );
  }
}
