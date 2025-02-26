import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Card, Col, Row } from "react-bootstrap";

const Dashboard = () => {
    const { data: session } = useSession();

    return (
        <>
            <Card className="w-50 mx-auto my-4 bg-secondary-subtle">
                <Card.Body>
                    <h2>Welcome {session.user.name}!</h2>
                    <p className="my-3 fs-5">Check out your budget, update your income or view the history of your budget.</p>
                    
                    <Row className="text-center">
                        <Col col={4}>
                            <Button as={Link} href="/budget" variant="dark" className="w-10 my-3">Budget</Button>
                        </Col>
                        <Col col={4}>
                            <Button as={Link} href="/income" variant="dark" className="w-10 my-3">Income</Button>
                        </Col>
                        <Col col={4}>
                            <Button as={Link} href="/history" variant="dark" className="w-10 my-3">History</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default Dashboard;