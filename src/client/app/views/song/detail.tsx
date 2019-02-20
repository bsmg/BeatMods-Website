import React, { Component } from "react";
import { ISong } from "src/server/v1/models";
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';

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
      <div key={`song-detail-${song._id}`} className="song__detail__wrapper">
      <div className="song__detail">
        <div>
          <div className="title">
            {song.songDetail.cover && <img src={song.songDetail.cover} />}
            <span>
            <h3>
              {song.songDetail.songName}
            </h3>            {song.user && (<span className="author">Uploaded by: <b><Link to={`/users/${song.user._id}`}>{song.user.username}</Link></b></span>)}
</span>
          </div>
          {song.description && <div className="description">{song.description}</div>}
          
          <div className="details">
            <div className="details__section">
              <span><b>Downloads:</b> {song.songDetail.downloadCount}</span>
              <span><b>Plays:</b> {song.songDetail.playCount}</span>
            </div>
            <div className="details__section">
              <span><b>BPM:</b> {song.songDetail.bpm}</span>
              <span><b>Difficulties:</b> {song.songDetail.difficultyLevels.map(i => i.difficulty).join(", ")}</span>
            </div>
            </div>
        </div>
        <div className="actions">
        <div className="actions__section">
          <Button onClick={() => {}}>Download Zip</Button>
          <Button onClick={() => {}}>OneClick Install</Button></div>
          <div className="actions__section">
          <Button onClick={() => {}}>View on BeastSaber</Button>
          <Button onClick={() => {}}>Preview</Button></div>
        </div>
      </div></div>
    );
  }
}
