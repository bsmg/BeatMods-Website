import React, { Component } from "react";
import { Alert, Card, CardBody, CardHeader, Col, Container, Form, InputGroup, Row } from "reactstrap";
import TagInput from "../../utils/tagInput";

export default class ModList extends Component<{ history: any; user: any | null }> {
    render() {
        if (!this.props.user || !this.props.user.admin) {
            return (
                <Container className="animated fadeIn">
                    <Row className="justify-content-center">
                        <Col md="12" lg="12" xl="12">
                            <Alert color="danger">You need to be an admin to access this page.</Alert>
                        </Col>
                    </Row>
                </Container>
            );
        } else {
            return (
                <Container className="animated fadeIn p-5">
                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardHeader>
                                    <h3>Game versions</h3>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <InputGroup>
                                            <TagInput className="d-block" placeholder="Test" />
                                        </InputGroup>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="6">
                            <Card>
                                <CardHeader>
                                    <h3>Mod categories</h3>
                                </CardHeader>
                                <CardBody>
                                    <Form>
                                        <InputGroup>
                                            <TagInput className="d-block" />
                                        </InputGroup>
                                    </Form>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            );
        }
    }
}
