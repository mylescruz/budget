import Link from "next/link";
import { Button, Card, Container, Row } from "react-bootstrap";

const Layout404 = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center redirect">
            <Card className="col-12 col-lg-6 mx-auto card-background">
                <Card.Body>
                    <Row>
                        <h5 className="text-center">This page doesn&#39;t exist!</h5>
                        <Button as={Link} href="/" className="w-25 my-2 mx-auto">Home</Button>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Layout404;