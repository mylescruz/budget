import Link from "next/link";
import { Button, Card, Container, Row } from "react-bootstrap";

const ErrorLayout = ({ message }) => {
    return (
        <Container className="d-flex justify-content-center align-items-center error-layout">
            <Card className="col-12 col-lg-6 mx-auto card-background">
                <Card.Body>
                    <Row className="text-center">
                        <h5>Sorry! Something went wrong!</h5>
                        <p>Please try again later.</p>
                        <Button as={Link} href="/" className="w-25 mx-auto">Home</Button>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    )
};

export default ErrorLayout;