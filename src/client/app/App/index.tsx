import * as React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import "./App.scss";
import Loadable from "react-loadable";
import axios from "axios";
const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);
const DefaultLayout = Loadable({
  loader: () => import("../layouts/default"),
  loading
});

const Login = Loadable({
  loader: () => import('../views/pages/Login'),
  loading
});
const Register = Loadable({
  loader: () => import('../views/pages/Register'),
  loading
});


export default class App extends React.Component<{}, {}> {

 
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" name="Home" component={RoutedComponents} />
        </Switch>
      </BrowserRouter>
    );
  }
}

class RoutedComponents extends React.Component<{history?: any}, {}> {
  async componentDidMount() {
    try {
      const {data, status} = await axios({
        method: "get",
        url: "/api/v1/user/current"
      });
      if (status == 200 && "_id" in data) {
        this.props.history.push("/");
      } 
    } catch (e) {
        this.props.history.push("/login");
    }
  }
  render() {
    return (<Switch>
      <Route exact path="/register" name="Register Page" component={Register} />,
      <Route exact path="/login" name="Login Page" component={Login} />,
      <Route path="/" name="Home" component={DefaultLayout} />
    </Switch>);
  }
}