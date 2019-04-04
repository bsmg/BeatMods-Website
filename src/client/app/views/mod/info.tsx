import React, { Component } from "react";
import axios from "axios";
import { IMod } from "src/server/v1/models";
import queryString from "querystring";
import { debounce } from "throttle-debounce";
import Mod from "./Mod";
import FormGroup from "reactstrap/lib/FormGroup";
import Label from "reactstrap/lib/Label";
import Input from "reactstrap/lib/Input";

export default class ModList extends Component<{ history: any; user: any | null }, { modList: IMod[]; query: { search: string; status: string[] } }> {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.refresh = debounce(500, this.refresh);
        this.state = { modList: [], query: { search: "", status: ["approved"] } };
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
                <div className="mods">
                    {this.state.modList.map(mod => {
                        return <Mod key={`mod-${mod._id}`} mod={mod} user={this.props.user} refresh={this.refresh} />;
                    })}
                </div>
            </div>
        );
    }
}
