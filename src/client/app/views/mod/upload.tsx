import React, { Component } from "react";
import axios from "axios";
import { Alert, Button, Card, CardBody, Col, Container, Form, Input, InputGroup, Row, FormText, Label } from "reactstrap";
import { Link } from "react-router-dom";
// @ts-ignore
import { gameVersions, modCategories } from "../../../../config/lists";

export default class SongUpload extends Component<{ history: any; user: any | null }, { error: string | null }> {
    fileUpload: HTMLInputElement | null = null;
    oculusFileUpload: HTMLInputElement | null = null;
    steamFileUpload: HTMLInputElement | null = null;
    name: HTMLInputElement | null = null;
    version: HTMLInputElement | null = null;
    gameVersion: HTMLInputElement | null = null;
    description: HTMLInputElement | null = null;
    dependencies: HTMLInputElement | null = null;
    link: HTMLInputElement | null = null;
    category: HTMLInputElement | null = null;

    async onSubmit() {
        const formData = new FormData();
        if (this && this.fileUpload != null && this.fileUpload.files && this.fileUpload.files.length) {
            formData.append("file", this.fileUpload.files[0]);
        } else {
            const hasUpload: boolean[] = [];
            if (this && this.steamFileUpload != null && this.steamFileUpload.files && this.steamFileUpload.files.length) {
                formData.append("file", this.steamFileUpload.files[0]);
                hasUpload.push(true);
            }
            if (this && this.oculusFileUpload != null && this.oculusFileUpload.files && this.oculusFileUpload.files.length) {
                formData.append("file", this.oculusFileUpload.files[0]);
                hasUpload.push(true);
            }
            if (hasUpload.length !== 2) {
                this.setState({ error: "You need to include both Steam and Oculus File Uploads. Otherwise use the Universal File Upload" });
                return;
            }
        }
        if (this && this.name != null && this.name.value) {
            formData.append("name", this.name.value);
        } else {
            this.setState({ error: "Mod Name is required" });
            return;
        }
        if (this && this.version != null && this.version.value) {
            formData.append("version", this.version.value);
        } else {
            this.setState({ error: "Version is required" });
            return;
        }
        if (this && this.gameVersion != null && this.gameVersion.value) {
            formData.append("gameVersion", this.gameVersion.value);
        } else {
            this.setState({ error: "Game version is required" });
            return;
        }
        if (this && this.link != null && this.link.value) {
            formData.append("link", this.link.value);
        } else {
            this.setState({ error: "Info link is required" });
            return;
        }
        if (this && this.description != null && this.description.value) {
            formData.append("description", this.description.value);
        }
        if (this && this.dependencies != null && this.dependencies.value) {
            formData.append("dependencies", this.dependencies.value);
        }
        if (this && this.category != null && this.category.value) {
            formData.append("category", this.category.value);
        }
        try {
            const { data } = await axios({
                method: "post",
                url: "/api/v1/mod/create/",
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            if (data === true) {
                setTimeout(() => {
                    this.props.history.push("/mods");
                }, 0);
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
                                You need to <Link to="/register">register an account</Link> before you can upload mods
                            </Alert>
                        </Col>
                    </Row>
                </Container>
            );
        }
        return (
            <Container className="animated fadeIn">
                <Row className="justify-content-center">
                    <Col md="9" lg="7" xl="6">
                        <Card className="mx-4">
                            <CardBody className="p-4">
                                <Form
                                    className="upload"
                                    onSubmit={e => {
                                        e.preventDefault();
                                        this.onSubmit();
                                    }}
                                >
                                    <h1>Upload Mod</h1>
                                    <FormText>
                                        Check out the{" "}
                                        <a href="https://docs.google.com/document/d/15RBVesZdS-U94AvesJ2DJqcnAtgh9E2PZOcbjrQle5Y/" target="_blank">
                                            Approval Guide
                                        </a>{" "}
                                        before you submit a mod.
                                    </FormText>
                                    <br />
                                    <FormText>
                                        We need some basic data about your mod before we can publish it. Please fill out the inputs below.{" "}
                                        <b>After you submit your mod, it will need to be reviewed before being approved.</b>
                                    </FormText>
                                    <FormText>
                                        Note that when you add dependencies, they already need to exist on BeatMods. Please include the exact name that is uploaded.
                                    </FormText>
                                    <FormText>
                                        The formatting of the dependencies is <code>ModName1@0.0.1,Mod With Spaces@1.2.0</code>
                                    </FormText>
                                    <hr />
                                    {this.state && this.state.error && (
                                        <Alert style={{ margin: "20px auto" }} color="danger">
                                            {this.state.error}
                                        </Alert>
                                    )}
                                    <InputGroup className="mb-3">
                                        <Label>Mod Name *</Label>
                                        <Input type="text" placeholder="Some Mod that does things" innerRef={input => (this.name = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Mod Version *</Label>
                                        <Input type="text" placeholder="0.0.1" innerRef={input => (this.version = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Game Version *</Label>
                                        <Input type="select" innerRef={input => (this.gameVersion = input)}>
                                            {gameVersions.map(v => (
                                                <option value={v} key={v}>
                                                    {v}
                                                </option>
                                            ))}
                                        </Input>
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Dependencies</Label>
                                        <Input type="text" placeholder="SongLoader@6.10.0,Ini Parser@2.5.2" innerRef={input => (this.dependencies = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Category</Label>
                                        <Input type="select" innerRef={input => (this.category = input)}>
                                            {modCategories.map(c => (
                                                <option value={c} key={c}>
                                                    {c}
                                                </option>
                                            ))}
                                        </Input>
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Description</Label>
                                        <Input
                                            type="textarea"
                                            placeholder="200 characters about why your mod is the best mod"
                                            maxLength={200}
                                            innerRef={input => (this.description = input)}
                                        />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>More Info Link *</Label>
                                        <Input type="text" placeholder="http://github.com/" innerRef={input => (this.link = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Universal File Upload</Label>
                                        <Input type="file" accept=".zip" innerRef={input => (this.fileUpload = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Steam-Only File Upload</Label>
                                        <Input type="file" accept=".zip" innerRef={input => (this.steamFileUpload = input)} />
                                    </InputGroup>
                                    <InputGroup className="mb-3">
                                        <Label>Oculus-Only File Upload</Label>
                                        <Input type="file" accept=".zip" innerRef={input => (this.oculusFileUpload = input)} />
                                    </InputGroup>
                                    <Button color="success" block={true}>
                                        Upload
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
