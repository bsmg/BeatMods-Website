import React, { Component } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  FormText,
  Input,
  InputGroup,
  Row
} from "reactstrap";
import InputGroupText from 'reactstrap/lib/InputGroupText';

export default class SongUpload extends Component<
  { history: any },
  {}
> {
  fileUpload: HTMLInputElement | null = null;

  async onSubmit() {
    const formData = new FormData();
    if (this && this.fileUpload != null && this.fileUpload.files) {
      formData.append("file", this.fileUpload.files[0]);
    }
    await axios({
      method: "post",
      url: "/api/v1/song/create/",
      data: formData,
      headers: {
          "Content-Type": "multipart/form-data"
      }
    });
  }
  render() {
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
                  <h1>Upload Beat Track</h1>
                  <InputGroup>
                    <FormText>
                      <h3>Must meet the following upload rules</h3>
                      <ul>
                        <li>Must be a ZIP file with the songs subfolder in the root (EG: SongName/info.json)</li>
                        <li>Must be under 15MB</li>
                        <li>Must contain valid metadata (UTF-8 encoded) and album art</li>
                        <li>Make sure you have permission to use any content involved in your beatmap. This includes songs, videos, hit sounds, graphics, and any other content that isn't your own creation. </li>
                        <li>Do not plagiarise or attempt to steal the work of others. Do not also upload or use other people's work without their explicit permission (including, but not limited to, skins and guest difficulties). </li>
                      </ul>
                    </FormText>
                  </InputGroup>
                  <InputGroup>
                    <FormText>
                      <h3>Useful tips for avoiding problems</h3>
                      <ul>
                        <li>Avoid using UNICODE charters in folder or file names. BeatSaber has no support for them.</li>
                        <li>Remove unnecessary content from the zip file (like autosaves folder from the 3D editor).</li>
                        <li>Check out these <a href="https://bsaber.com/benny-custom-mapping/">fantastic tutorials</a> by <a href="/users/BennyDaBeast">BennyDaBeast</a> on how to make a great beat map.</li>
                        </ul>
                    </FormText>
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Input
                      type="file"
                      autoComplete="username"
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
