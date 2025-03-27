import { signIn } from "next-auth/react";
import { Button, Container, Row } from "react-bootstrap";

const RedirectLayout = () => {
    const login = async () => {
        await signIn({ callbackUrl: '/'});
    };

    return (
        <Container className="d-flex justify-content-center align-items-center redirect">
            <Row>
                <h5 className="text-center">You must be logged in to access this page!</h5>
                <Button className="w-25 mx-auto" onClick={login}>Login</Button>
            </Row>
        </Container>
    );
};

export default RedirectLayout;