import React, { Component } from "react";
import { ISong } from "src/server/v1/models";

export default class SongDetail extends Component<
  { song: ISong; key?: string },
  { song?: ISong | null }
> {
  constructor(props) {
    super(props);
    this.state = { song: props.song };
  }
  componentWillReceiveProps(newProps) {
    if (newProps.song !== this.props.song) {
      this.setState({ song: newProps.song });
    }
  }
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  )
  render() {
    const { song } = this.state;
    if (!song) {
      return this.loading;
    }
    return (
      <div key={`song-detail-${song._id}`} className="row">
        <div className="col-md-2">
          {song.songDetail.cover && <img src={song.songDetail.cover} />}
        </div>
        <div className="col-md-7">
          <h3>
            {song.songDetail.songName} - {song.songDetail.authorName}
          </h3>
        </div>
        <div className="col-md-3" />
      </div>
    );
  }
}
