import React, { Component } from "react";
import { Badge, Input } from "reactstrap";

export default class TagInput extends Component<Partial<Input> & Partial<HTMLInputElement>, { value: string[]; display: string }> {
    constructor(props) {
        super(props);
        const value = props.value ? props.value : [];
        const display = value[0] || "";
        this.state = { value: value, display: display };
    }

    handleChange = ({ target: { value } }) => {
        if (value.length && value[value.length - 1] === ",") {
            value = value.slice(0, -1);
            this.setState({ display: value });
            if (!/^\W*$/g.test(this.state.display)) {
                this.addTag();
            }
        } else {
            this.setState({ display: value });
        }
    }

    handleKeyUp = e => {
        if (e.key.toLowerCase() === "backspace" && this.state.value.length && this.state.display === "") {
            e.preventDefault();
            this.editLastTag();
        } else if (e.key.toLowerCase() === "enter" && !/^\W*$/g.test(this.state.display)) {
            e.preventDefault();
            this.addTag();
        }
    }

    addTag = () => {
        const value = this.state.value;
        value.push(this.state.display);
        this.setState({ value, display: "" });
    }

    deleteTag = ({ target }) => {
        const value = this.state.value;
        const i = value.indexOf(target.id);
        if (i > -1) {
            value.splice(value.indexOf(target.id), 1);
            this.setState({ value });
        }
    }

    editLastTag = () => {
        const value = this.state.value.slice(0, -1);
        const display = this.state.value[this.state.value.length - 1];
        this.setState({ value, display });
    }

    render() {
        return (
            <div className="w-100">
                {this.state.value.length > 0 && (
                    <p>
                        {this.state.value.map(tag => (
                            <Badge color="secondary" className="mx-1" key={Math.random()}>
                                {tag}
                                <a id={tag} className="text-decoration-none text-danger ml-1" onClick={this.deleteTag} href="javascript:">
                                    &times;
                                </a>
                            </Badge>
                        ))}
                    </p>
                )}
                // @ts-ignore: Props extend Input
                <Input {...this.props} type="text" onChange={this.handleChange} onKeyUp={this.handleKeyUp} value={this.state.display} />
            </div>
        );
    }
}
