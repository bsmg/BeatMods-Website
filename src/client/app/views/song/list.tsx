import React, { Component } from "react";
import axios from "axios";
import { ISong } from "src/server/v1/models";
import SongDetail from "./detail";
import queryString from "querystring";
import { debounce } from 'throttle-debounce';

export default class SongList extends Component<
  { history: any },
  { songList: ISong[], query: {search: string} }
> {
  constructor(props) {
    super(props);
    this.refresh = debounce(500, this.refresh);
    this.state = { songList: [], query: {search: ""} };
  }
  async componentDidMount() {
    this.refresh();
  }
  async refresh() {
    const { data, status } = await axios({
      method: "get",
      url: `/api/v1/song?${queryString.stringify(this.state.query)}`
    });
    if (status === 200) {
      this.setState({ songList: data as ISong[] });
    }
  }

  render() {
    return (
      <div className="animated fadeIn">
        <input type="text" onChange={(e) => {
          this.setState({query: {search: encodeURIComponent(e.target.value)}}); 
          this.refresh();
        }} placeholder="Enter some search text"/>
        <div className="songs">
          {this.state.songList.map(song => {
            return <SongDetail key={`song-detail-${song._id}`} song={song} />;
          })}
        </div>
      </div>
    );
  }
}
