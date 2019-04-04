import React, { Component } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  Row,
  FormText,
  Label
} from "reactstrap";

export default class SongUpload extends Component<
  { history: any, user: any | null },
  { error: string | null}
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
    } else {
      this.setState({error: "Please upload a file"});
      return;
    }
    if (this && this.name != null && this.name.value) {
      formData.append("name", this.name.value);
    } else {
      this.setState({error: "Please set a name"});
      return;
    }
    if (this && this.version != null && this.version.value) {
      formData.append("version", this.version.value);
    } else {
      this.setState({error: "Please set a version"});
      return;
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
    } else {
      this.setState({error: result.data});
    }
  }
  render() {
    if (!this.props.user) {
      return (<Container className="animated fadeIn">
      <Row className="justify-content-center">
        <Col md="12" lg="12" xl="12">
          <Card className="mx-12">
            <CardBody className="p-12">
            <Alert color="danger">You need to register an account before you can upload mods</Alert>
            </CardBody></Card></Col></Row></Container>);
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
                    We need some basic data about your mod before we can publish it. Please fill out the inputs below. <b>After you submit your mod, it will need to be reviewed before being approved.</b>
                  </FormText>
                  <FormText>
                    Note that when you add dependencies, they already need to exist on BeatMods. Please include the exact name that is uploaded.
                  </FormText>
                  <FormText>
                    The formatting of the dependencies is <code>ModName1@0.0.1,Mod With Spaces@1.2.0</code>
                  </FormText>
                  <hr />
                  <InputGroup className="mb-3">
                    <Label>Mod Name *</Label>
                    <Input
                      type="text"
                      placeholder="Some Mod that does things"
                     innerRef={(input) => this.name = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Label>Mod Version *</Label>
                    <Input
                      type="text"
                      placeholder="0.0.1"
                     innerRef={(input) => this.version = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Label>Dependencies</Label>
                    <Input
                      type="text"
                      placeholder="SongLoader@6.10.0,Ini Parser@2.5.2"
                     innerRef={(input) => this.dependencies = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Label>Description</Label>
                    <Input
                      type="textarea"
                      placeholder="200 characters about why your mod is the best mod"
                      maxLength={200}
                      innerRef={(input) => this.description = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Label>More Info Link</Label>
                    <Input
                      type="text"
                      placeholder="http://github.com/"
                      innerRef={(input) => this.link = input }
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Label>File Upload *</Label>
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
                {this.state && this.state.error && (<Alert color="danger">{this.state.error}</Alert>)}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
