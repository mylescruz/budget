import { Button, Card, Col, FloatingLabel, Form, Row } from "react-bootstrap";

const Home = () => {
    return (
        <>
            <h1 className="text-center my-4">Type-A Budgeting</h1>
            <p className="mx-auto my-4 w-25">A budget app for type-A people who want to track their finances down to the cent. Login to see where you&#39;re allocating your money.</p>

            <Card className="w-25 mx-auto">
            <Card.Body>
                <Form>
                    <FloatingLabel controlId="email" label="Email address" className="mb-3">
                        <Form.Control type="email" placeholder="name@example.com" />
                    </FloatingLabel>
                    <FloatingLabel controlId="password" label="Password">
                        <Form.Control type="password" placeholder="Password" />
                    </FloatingLabel>
                    <Button type="submit" variant="primary" className="w-100 my-3 float-end">Sign in</Button>
                </Form>
                <Row>
                    <Col><p className="float-end">Create account</p></Col>
                </Row>
            </Card.Body>
            </Card>
        </>
    );
};

export default Home;