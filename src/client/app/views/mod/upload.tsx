import React, { Component } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  Row
} from "reactstrap";

export default class SongUpload extends Component<
  { history: any, user: any | null },
  {disabled: boolean}
> {
  fileUpload: HTMLInputElement | null = null;
  name: HTMLInputElement | null = null;
  version: HTMLInputElement | null = null;
  description: HTMLInputElement | null = null;
  dependencies: HTMLInputElement | null = null;
  link: HTMLInputElement | null = null;
  
  async onSubmit() {
    const formData = new FormData();
    if (this && this.fileUpload != null && this.fileUpload.files) {
      formData.append("file", this.fileUpload.files[0]);
    }
    if (this && this.name != null && this.name.value) {
      formData.append("name", this.name.value);
    }
    if (this && this.version != null && this.version.value) {
      formData.append("version", this.version.value);
    }
    if (this && this.description != null && this.description.value) {
      formData.append("description", this.description.value);
    }
    if (this && this.link != null && this.link.value) {
      formData.append("link", this.link.value);
    }
    if (this && this.dependencies != null && this.dependencies.value) {
      formData.append("dependencies", this.dependencies.value);
    }
    const result = await axios({
      method: "post",
      url: "/api/v1/mod/create/",
      data: formData,
      headers: {
          "Content-Type": "multipart/form-data"
      }
    });
    if (result.data == true) {
      setTimeout(() => {
        this.props.history.push("/mods");
    }, 0);
    }
  }
  render() {
    if (!this.props.user) {
      return (<Container className="animated fadeIn">
      <Row className="justify-content-center">
        <Col md="12" lg="12" xl="12">
          <Card className="mx-12">
            <CardBody className="p-12">
            <h3>You need to register an account before you can upload mods</h3>
            </CardBody></Card></Col></Row></Container>);
    }
    return (
      <Container className="animated fadeIn">
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
                  <h1>Upload Mod</h1>
                  <InputGroup className="mb-3">
                    <Input
                      type="text"
                      placeholder="Mod Name"
                     innerRef={(input) => this.name = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="text"
                      placeholder="Mod Version"
                     innerRef={(input) => this.version = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="text"
                      placeholder="Dependencies"
                     innerRef={(input) => this.dependencies = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="textarea"
                      placeholder="Description"
                      maxLength={200}
                      innerRef={(input) => this.description = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="text"
                      placeholder="Information Link"
                      innerRef={(input) => this.link = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="file"
                      accept=".zip"
                     innerRef={(input) => this.fileUpload = input }
                    />
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
