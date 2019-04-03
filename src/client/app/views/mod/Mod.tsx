import { IMod } from 'src/server/v1/models';
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import Button from 'reactstrap/lib/Button';

export default class Mod extends Component<
{ mod: IMod },
{}
> {
    render() {
        const {mod} = this.props;
        return (<div className="mod__wrapper">
            <div className="mod">
            <div className="name">
            <h3>{mod.name}<small className="version">v{mod.version}</small><span className={`badge badge--${mod.status}`}>{mod.status}</span></h3>
            {mod.author && (
                  <span className="author">
                    Author:{" "}
                    <b>
                      <Link to={`/users/${mod.author._id}`}>
                        {mod.author.username}
                      </Link>
                    </b>
                  </span>
)}
            </div>
                <div className="mod__details">
                    {mod.dependencies.length > 0 && (<div className="dependencies">Dependencies: <code>{mod.dependencies.map((item, i) => <span key={`dependency-${item._id}`}>{item.name}@{item.version}{i !== mod.dependencies.length - 1 ? ", " : ""}</span>)}</code></div>)}
                    {mod.description && mod.description.length > 0 && (<div className="description">{mod.description}</div>)}
                </div>
          <div className="actions">
            <div className="actions__section">
            </div>
            <div className="actions__section">
              <Button onClick={() => {window.open(`/uploads/${mod._id}/${mod.name}-${mod.version}.zip`)}}>Download Zip</Button>
            </div>
</div>
            </div>
        </div>);
    }
};