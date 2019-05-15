import React, { Component } from "react";
import { Alert, Button, Card, CardBody, CardDeck, CardTitle, Col, Container, ListGroup, ListGroupItem, Row } from "reactstrap";
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
                    <CardDeck>
                        <Card className="mb-3">
                            <CardBody>
                                <CardTitle className="h3">Game versions</CardTitle>
                                <TagInput />
                            </CardBody>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>
                                    <Button color="primary">Update</Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Card>
                        <div className="w-100 d-lg-none" />
                        <Card className="mb-3">
                            <CardBody>
                                <CardTitle className="h3">Mod categories</CardTitle>
                                <TagInput />
                            </CardBody>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>
                                    <Button color="primary">Update</Button>
                                </ListGroupItem>
                            </ListGroup>
                        </Card>
                    </CardDeck>
                </Container>
            );
        }
    }
}
