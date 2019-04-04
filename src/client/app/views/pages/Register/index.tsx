import React, { Component } from "react";
import axios from "axios";
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";

export default class Register extends Component<{ history: any }, { username: string; email: string; password: string; verifyPassword: string }> {
    async onSubmit() {
        if (this.state.password !== this.state.verifyPassword) {
            console.error("INVALID PASSWORD");
            return;
        }
        const { data, status } = await axios({
            method: "post",
            url: "/api/v1/register",
            data: {
                username: this.state.username,
                password: this.state.password,
                email: this.state.email
            }
        });
        if (status !== 200 && "key" in data && "data" in data) {
            console.error(`${data.httpStatus} Error`, data.key, data.data);
        }
        if (status === 200 && "_id" in data) {
            this.props.history.push("/login");
        }
    }
    render() {
        return (
            <div className="app flex-row align-items-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md="9" lg="7" xl="6">
                            <Card className="mx-4">
                                <CardBody className="p-4">
                                    <Form
                                        onSubmit={e => {
                                            e.preventDefault();
                                            this.onSubmit();
                                        }}
                                    >
                                        <h1>Register</h1>
                                        <p className="text-muted">Create your account</p>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-user" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="text" placeholder="Username" autoComplete="username" onChange={e => this.setState({ username: e.target.value })} />
                                        </InputGroup>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>@</InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="text" placeholder="Email" autoComplete="email" onChange={e => this.setState({ email: e.target.value })} />
                                        </InputGroup>
                                        <InputGroup className="mb-3">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input type="password" placeholder="Password" autoComplete="new-password" onChange={e => this.setState({ password: e.target.value })} />
                                        </InputGroup>
                                        <InputGroup className="mb-4">
                                            <InputGroupAddon addonType="prepend">
                                                <InputGroupText>
                                                    <i className="icon-lock" />
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <Input
                                                type="password"
                                                placeholder="Repeat password"
                                                autoComplete="new-password"
                                                onChange={e => this.setState({ verifyPassword: e.target.value })}
                                            />
                                        </InputGroup>
                                        <Button color="success" block={true}>
                                            Create Account
                                        </Button>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
