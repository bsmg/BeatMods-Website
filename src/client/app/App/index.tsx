import * as React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import "./App.scss";
import Loadable from "react-loadable";

const loading = () => (
  <div className="animated fadeIn pt-3 text-center">Loading...</div>
);
const DefaultLayout = Loadable({
  loader: () => import("../layouts/default"),
  loading
});
export default class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}
