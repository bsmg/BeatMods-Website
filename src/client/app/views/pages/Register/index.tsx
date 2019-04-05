import React, { Component } from "react";
import axios from "axios";
import { Alert, Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from "reactstrap";

export default class Register extends Component<{ history: any }, { username: string; email: string; password: string; verifyPassword: string; error: string }> {
    async onSubmit() {
        if (!this.state || this.state.password !== this.state.verifyPassword) {
            this.setState({ error: "Passwords do not match" });
            return;
        }
        try {
            const { data, status } = await axios({
                method: "post",
                url: "/api/v1/register",
                data: {
                    username: this.state.username,
                    password: this.state.password,
                    email: this.state.email
                }
            });
            if (status === 200 && "_id" in data) {
                this.props.history.push("/login");
            }
        } catch ({ response }) {
            const data = response.data;
            if ("key" in data && "data" in data) {
                this.setState({ error: `Error: '${data.key}' ${data.data}` });
            }
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
                                        {this.state && this.state.error && (
                                            <Alert style={{ margin: "20px auto" }} color="danger">
                                                {this.state.error}
                                            </Alert>
                                        )}
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
