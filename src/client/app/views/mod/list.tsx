import React, { Component } from "react";
import axios from "axios";
import { IMod } from "src/server/v1/models";
import queryString from "querystring";
import { debounce } from 'throttle-debounce';
import Mod from "./Mod";

export default class ModList extends Component<
  { history: any, user: any | null },
  { modList: IMod[], query: {search: string, status: "approved"|"pending"|"declined"} }
> {
  constructor(props) {
    super(props);
    this.refresh = debounce(500, this.refresh);
    this.state = { modList: [], query: {search: "", status: "approved"} };
  }
  async componentDidMount() {
    this.refresh();
  }
  async refresh() {
    const { data, status } = await axios({
      method: "get",
      url: `/api/v1/mod?${queryString.stringify(this.state.query)}`
    });
    if (status === 200) {
      this.setState({ modList: data as IMod[] });
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        {/* <input type="text" onChange={(e) => {
          this.setState({query: {search: encodeURIComponent(e.target.value), status: this.state.query.status}}); 
          this.refresh();
        }} placeholder="Enter some search text"/> */}
        <div className="mods">
          {this.state.modList.map(mod => {
            return <Mod key={`mod-${mod._id}`} mod={mod} />;
          })}
        </div>
      </div>
    );
  }
}
