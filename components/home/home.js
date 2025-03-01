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
            <Card className="col-10 col-sm-8 col-md-8 col-lg-8 col-xl-6 mx-auto my-4 bg-dark-subtle">
                <Card.Body>
                    <h2 className="text-center">The Type-A Budget</h2>
                    <p className="my-3 fs-5">A budget for people who want to manually track their finances down to the cent. <br /> Login to see where you&#39;re allocating your money!</p>
                    
                    <Row className="text-center mx-auto">
                        <Col>
                            <Button variant="dark" className="my-3" onClick={userSignIn}>Login</Button>
                        </Col>
                        <Col>
                            <Button as={Link} href="/createaccount" variant="dark" className="my-3">Sign up</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }
};

export default Home;