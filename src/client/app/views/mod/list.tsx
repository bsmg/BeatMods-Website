import React, { Component } from "react";
import axios from "axios";
import { IMod } from "src/server/v1/models";
import queryString from "querystring";
import { debounce } from "throttle-debounce";
import Mod from "./Mod";
import { Alert, FormGroup, Label, Input } from "reactstrap";

export default class ModList extends Component<
    { history: any; user: any | null },
    { modList: IMod[]; query: { search: string; status: string[] }; error: string; sort: string; sortDirection: number }
> {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.refresh = debounce(500, this.refresh);
        this.state = { error: "", modList: [], query: { search: "", status: ["approved"] }, sort: "category", sortDirection: 1 };
    }
    async componentDidMount() {
        this.refresh();
    }
    async refresh() {
        try {
            const { data, status } = await axios({
                method: "get",
                url: `/api/v1/mod?${queryString.stringify(this.state.query)}&sort=${this.state.sort}&sortDirection=${this.state.sortDirection}`
            });
            if (status === 200) {
                this.setState({ modList: data as IMod[] });
            }
        } catch ({ response }) {
            const data = response.data;
            if ("key" in data && "data" in data) {
                this.setState({ error: `Error: '${data.key}' ${data.data}` });
            }
        }
    }

    addCheck(e, label: string) {
        const value = e.target.checked;
        let status: string[] = [];
        if (this.state && this.state.query.status) {
            status = this.state.query.status;
        }

        if (value) {
            if (status.indexOf(label) === -1) {
                this.setState({ query: { ...this.state.query, status: [...status, label] } }, this.refresh);
            }
        } else {
            if (status.indexOf(label) !== -1) {
                status.splice(status.indexOf(label), 1);
                this.setState({ query: { ...this.state.query, status } }, this.refresh);
            }
        }
    }
    render() {
        return (
            <div className="animated fadeIn">
                <div className="filters">
                    {this.props.user && this.props.user.admin && (
                        <div>
                            <Label>Approval Status</Label>
                            <FormGroup check={true}>
                                <Label check={true}>
                                    <Input type="checkbox" checked={this.state.query.status.indexOf("approved") !== -1} onChange={e => this.addCheck(e, "approved")} /> Approved
                                </Label>
                            </FormGroup>
                            <FormGroup check={true}>
                                <Label check={true}>
                                    <Input type="checkbox" checked={this.state.query.status.indexOf("pending") !== -1} onChange={e => this.addCheck(e, "pending")} /> Pending
                                </Label>
                            </FormGroup>
                            <FormGroup check={true}>
                                <Label check={true}>
                                    <Input type="checkbox" checked={this.state.query.status.indexOf("declined") !== -1} onChange={e => this.addCheck(e, "declined")} /> Declined
                                </Label>
                            </FormGroup>
                        </div>
                    )}
                    <div className="search">
                        <Label>Search</Label>
                        <FormGroup>
                            <Input
                                type="text"
                                value={this.state.query.search}
                                onChange={e => this.setState({ query: { ...this.state.query, search: e.target.value } }, this.refresh)}
                            />
                            <i className="fa fa-search" />
                        </FormGroup>
                    </div>
                    <div>
                        <Label>Sort</Label>
                        <FormGroup>
                            <Input type="select" name="select" value={this.state.sort} onChange={e => this.setState({ sort: e.target.value }, this.refresh)}>
                                <option value="category">Category</option>
                                <option value="name">Name</option>
                                <option value="status">Status</option>
                                <option value="author.username">Author</option>
                                <option value="updatedDate">Last Updated</option>
                            </Input>
                        </FormGroup>
                    </div>
                    <div>
                        <Label>Sort Direction</Label>
                        <FormGroup>
                            <Input
                                type="select"
                                name="select"
                                value={this.state.sortDirection}
                                onChange={e => this.setState({ sortDirection: Number(e.target.value) }, this.refresh)}
                            >
                                <option value="1">Ascending</option>
                                <option value="-1">Descending</option>
                            </Input>
                        </FormGroup>
                    </div>
                </div>

                {this.state && this.state.error && (
                    <Alert style={{ margin: "20px auto" }} color="danger">
                        {this.state.error}
                    </Alert>
                )}
                <div className="mods">
                    {this.state.modList.map(mod => {
                        return <Mod key={`mod-${mod._id}`} mod={mod} user={this.props.user} refresh={this.refresh} />;
                    })}
                </div>
            </div>
        );
    }
}
