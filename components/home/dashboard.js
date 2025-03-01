import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button, Card, Col, Row } from "react-bootstrap";

const Dashboard = () => {
    const { data: session } = useSession();
    const router = useRouter();

    // If no session, redirect back to home page
    if (!session) {
        router.push('/');
    }
    
    return (
        <>
            <Card className="col-10 col-sm-8 col-md-8 col-lg-8 col-xl-6 mx-auto my-4 bg-secondary-subtle">
                <Card.Body>
                    <h2>Welcome {session.user.name}!</h2>
                    <p className="my-3 fs-5">Check out your budget, update your income or view the history of your budget.</p>
                    
                    <Row className="mx-auto text-center">
                        <Col xs={12} sm={4}>
                            <Button as={Link} href="/budget" variant="dark" className="w-10 my-3">Budget</Button>
                        </Col>
                        <Col xs={12} sm={4}>
                            <Button as={Link} href="/income" variant="dark" className="w-10 my-3">Income</Button>
                        </Col>
                        <Col xs={12} sm={4}>
                            <Button as={Link} href="/history" variant="dark" className="w-10 my-3">History</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </>
    );
};

export default Dashboard;