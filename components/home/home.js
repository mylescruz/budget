import { signIn, useSession } from "next-auth/react";
import Dashboard from "./dashboard";
import { Button, Card, Col, Row } from "react-bootstrap";
import Link from "next/link";

const Home = () => {
    const { data: session } = useSession();

    const userSignIn = async () => {
        await signIn({ callbackUrl: '/'});
    };

    if (session) {
        return <Dashboard />;
    } else {
        return (
            <Card className="w-50 mx-auto my-4 bg-secondary-subtle">
                <Card.Body>
                    <h2>The Type-A Budget</h2>
                    <p className="my-3 fs-5">A budget for people who want to track their finances down to the cent. <br /> Login to see where you&#39;re allocating your money!</p>
                    
                    <Row className="text-center w-50 mx-auto">
                        <Col>
                            <Button variant="dark" className="w-10 my-3" onClick={userSignIn}>Sign in</Button>
                        </Col>
                        <Col>
                            <Button as={Link} href="/createaccount" variant="dark" className="w-10 my-3">Create account</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }
};

export default Home;