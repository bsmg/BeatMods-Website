import React, { Component } from "react";
import axios from "axios";
import { ISong } from "src/server/v1/models";
import SongDetail from "./detail";

export default class SongList extends Component<
  { history: any },
  { songList: ISong[] }
> {
  constructor(props) {
    super(props);
    this.state = { songList: [] };
  }
  async componentDidMount() {
    const { data, status } = await axios({
      method: "get",
      url: "/api/v1/song/"
    });
    if (status === 200) {
      this.setState({ songList: data as ISong[] });
    }
  }
  render() {
    return (
      <div className="animated fadeIn">
        {this.state.songList.map(song => {
          return <SongDetail key={`song-detail-${song._id}`} song={song} />;
        })}
      </div>
    );
  }
}
