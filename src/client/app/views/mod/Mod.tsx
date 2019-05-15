import { IMod } from "src/server/v1/models";
import React, { Component } from "react";
import axios from "axios";
import Button from "reactstrap/lib/Button";
import Input from "reactstrap/lib/Input";
import InputGroup from "reactstrap/lib/InputGroup";
import Label from "reactstrap/lib/Label";
import moment from "moment";
import { gameVersions, modCategories } from "../../../../config/lists";
const sanitizeHtml = require("sanitize-html");
export default class Mod extends Component<{ mod: IMod; user: any | null; refresh: any }, { editing: boolean; update: Partial<IMod> }> {
    constructor(props) {
        super(props);
        this.state = { editing: false, update: {} };
    }
    componentWillReceiveProps(newProps) {
        if (!this.state || newProps.mod !== this.props.mod) {
            this.setState({});
        }
    }
    async update(mod: dynamic, update = false) {
        if (update && Object.keys(mod).length) {
            try {
                await axios({
                    method: "post",
                    url: `/api/v1/mod/${this.props.mod._id}`,
                    data: mod
                });
                this.props.refresh();
            } catch ({ response }) {
                const data = response.data;
                if ("key" in data && "data" in data) {
                    alert(`Error: '${data.key}' ${data.data}`);
                }
            }
        } else if (!update) {
            this.setState({ update: { ...(this.state || {}).update, ...mod } });
        }
    }
    renderEdit() {
        const { mod } = this.props;

        return (
            <div className="mod__wrapper">
                <div className="mod mod--edit">
                    {this.props.user && (this.props.user.admin || this.props.user._id === this.props.mod.authorId) && (
                        <span className="edit" onClick={() => this.setState({ editing: !this.state.editing }, () => this.update(this.state.update, true))}>
                            <i className="fa fa-save" />
                        </span>
                    )}
                    <InputGroup>
                        <Label>Name: *</Label>
                        <Input
                            type="text"
                            value={this.state.update.name || mod.name}
                            onChange={e => {
                                if (e.target.value) {
                                    this.update({ name: e.target.value });
                                }
                            }}
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Version: *</Label>
                        <Input
                            type="text"
                            value={this.state.update.version || mod.version}
                            onChange={e => {
                                if (e.target.value) {
                                    this.update({ version: e.target.value });
                                }
                            }}
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Game Version: *</Label>
                        <Input type="select" value={this.state.update.gameVersion || mod.gameVersion} onChange={e => this.update({ gameVersion: e.target.value })}>
                            {gameVersions.map(v => (
                                <option value={v}>{v}</option>
                            ))}
                        </Input>
                    </InputGroup>
                    {this.props.user && this.props.user.admin && (
                        <InputGroup>
                            <Label>Category: </Label>
                            <Input type="select" value={this.state.update.category || mod.category} onChange={e => this.update({ category: e.target.value })}>
                                {modCategories.map(c => (
                                    <option value={c}>{c}</option>
                                ))}
                            </Input>
                        </InputGroup>
                    )}
                    {this.props.user && this.props.user.admin && (
                        <InputGroup>
                            <Label>Required: </Label>
                            <Input
                                type="checkbox"
                                checked={"required" in this.state.update ? this.state.update.required : mod.required}
                                onChange={e => this.update({ required: e.target.checked })}
                            />
                        </InputGroup>
                    )}
                    <InputGroup>
                        <Label>Dependencies: </Label>
                        <Input
                            type="text"
                            value={
                                this.state.update.dependencies ||
                                mod.dependencies.map((item, i) => `${item.name}@${item.version}${i !== mod.dependencies.length - 1 ? "," : ""}`) ||
                                ""
                            }
                            onChange={e => this.update({ dependencies: e.target.value })}
                        />
                    </InputGroup>
                    <InputGroup>
                        <Label>Description: </Label>
                        <Input type="textarea" value={this.state.update.description || mod.description || ""} onChange={e => this.update({ description: e.target.value })} />
                    </InputGroup>
                    <InputGroup>
                        <Label>More Info Link: *</Label>
                        <Input
                            type="text"
                            value={this.state.update.link || mod.link}
                            onChange={e => {
                                if (e.target.value) {
                                    this.update({ link: e.target.value });
                                }
                            }}
                        />
                    </InputGroup>{" "}
                </div>
            </div>
        );
    }
    render() {
        if (this.state.editing) {
            return this.renderEdit();
        }
        const { mod } = this.props;
        return (
            <div className="mod__wrapper">
                <div className="mod">
                    {mod.status !== "declined" && this.props.user && (this.props.user.admin || this.props.user._id === this.props.mod.authorId) && (
                        <span className="edit" onClick={() => this.setState({ editing: !this.state.editing })}>
                            <i className="fa fa-edit" />
                        </span>
                    )}
                    <div className="name">
                        <h3>
                            {mod.name}
                            <small className="version">v{mod.version}</small>
                        </h3>
                    </div>
                    <h4>
                        {mod.author !== undefined && (
                            <span>
                                By&nbsp;<b>{mod.author.username}</b>
                            </span>
                        )}{" "}
                        &nbsp;|&nbsp;Updated {moment(new Date(mod.updatedDate || mod.uploadDate)).fromNow()}
                        &nbsp;|&nbsp;For {mod.gameVersion || "Unspecified"}
                    </h4>
                    <div className="badges">
                        {mod.category && <span className={`badge badge-secondary`}>{mod.category}</span>}
                        <span className={`badge badge--${mod.status}`}>{mod.status}</span>
                        {mod.required && <span className={`badge badge-primary`}>Required</span>}
                    </div>
                    <div className="mod__details">
                        {mod.dependencies.length > 0 && (
                            <div className="dependencies">
                                Dependencies:{" "}
                                <code>
                                    {mod.dependencies.map((item, i) => (
                                        <span key={`dependency-${item._id}`}>
                                            {item.name}@{item.version}
                                            {i !== mod.dependencies.length - 1 ? ", " : ""}
                                        </span>
                                    ))}
                                </code>
                            </div>
                        )}
                        {mod.description &&
                            mod.description.length > 0 && [
                                <span key="description_label">Description:</span>,
                                <div
                                    key="description_value"
                                    className="description"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(mod.description)
                                    }}
                                />
                            ]}
                    </div>
                    <div className="actions">
                        <div className="actions__section">
                            {mod.downloads &&
                                mod.downloads.map(download => (
                                    <Button
                                        key={`${download.type}--${download.url}`}
                                        onClick={() => {
                                            window.open(`${download.url}`);
                                        }}
                                    >
                                        Download {download.type !== "universal" ? download.type + " " : ""}Zip
                                    </Button>
                                ))}
                        </div>
                        <div className="actions__section">
                            {mod.link && mod.link.length > 0 && (
                                <Button
                                    onClick={() => {
                                        window.open(`${mod.link}`);
                                    }}
                                >
                                    More Info
                                </Button>
                            )}
                        </div>
                        <div className="actions__section">
                            {mod.status !== "approved" && this.props.user && this.props.user.admin && (
                                <Button className="approve" onClick={() => this.update({ status: "approved" }, true)}>
                                    Approve
                                </Button>
                            )}
                            {mod.status !== "declined" && this.props.user && this.props.user.admin && (
                                <Button className="decline" onClick={() => this.update({ status: "declined" }, true)}>
                                    Decline
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
