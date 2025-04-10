import Link from "next/link";
import { useState } from "react";
import { Button, Card, Container, Modal, Row } from "react-bootstrap";

const ErrorLayout = ({ message }) => {
    const [viewError, setViewError] = useState(false);

    const openErrorModal = () => {
        setViewError(true);
    };

    const closeErrorModal = () => {
        setViewError(false);
    };

    return (
        <Container className="d-flex justify-content-center align-items-center error-layout">
            <Card className="col-12 col-lg-6 mx-auto card-background">
                <Card.Body>
                    <Row className="text-center">
                        <h5>Sorry! Something went wrong!</h5>
                        <p className="text-decoration-underline click" onClick={openErrorModal}>View error</p>
                        <p>Please try again later!</p>
                        <Button as={Link} href="/" className="w-25 mx-auto">Home</Button>
                    </Row>
                </Card.Body>
            </Card>

            <Modal show={viewError} onHide={closeErrorModal} centered>
                <Modal.Header closeButton>
                    Error Details
                </Modal.Header>
                <Modal.Body>
                    <p>{ message }</p>
                </Modal.Body>
            </Modal>
        </Container>
    )
};

export default ErrorLayout;