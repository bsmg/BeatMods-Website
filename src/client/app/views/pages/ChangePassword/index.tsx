import React, { Component } from "react";
import axios from "axios";
import { Alert, Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";
import { Link } from "react-router-dom";

export default class Register extends Component<{ history: any; user: any | null }, { current: string; password: string; verifyPassword: string; error: string }> {
    async onSubmit() {
        if (!this.state || this.state.password !== this.state.verifyPassword) {
            this.setState({ error: "Passwords do not match" });
            return;
        }
        try {
            const { status } = await axios({
                method: "post",
                url: "/api/v1/user/changePassword",
                data: {
                    current: this.state.current,
                    password: this.state.password
                }
            });
            if (status === 200) {
                this.props.history.push("/");
            }
        } catch ({ response }) {
            const data = response.data;
            if ("key" in data && "data" in data) {
                this.setState({ error: `Error: '${data.key}' ${data.data}` });
            }
        }
    }
    render() {
        if (!this.props.user) {
            return (
                <Container className="animated fadeIn">
                    <Row className="justify-content-center">
                        <Col md="12" lg="12" xl="12">
                            <Alert color="danger">
                                You need to <Link to="/login">log in to your account</Link> before you can change your password
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            );
        }
        return (
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
                                    <h1>Change Password</h1>
                                    <p className="text-muted">Set a new password for your account</p>
                                    {this.state && this.state.error && (
                                        <Alert style={{ margin: "20px auto" }} color="danger">
                                            {this.state.error}
                                        </Alert>
                                    )}
                                    <InputGroup className="mb-3">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="icon-lock" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            type="password"
                                            placeholder="Current Password"
                                            autoComplete="old-password"
                                            onChange={e => this.setState({ current: e.target.value })}
                                        />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="icon-lock" />
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input type="password" placeholder="New Password" autoComplete="new-password" onChange={e => this.setState({ password: e.target.value })} />
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
                                        Change Password
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
}
