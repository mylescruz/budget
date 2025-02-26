import { Container, Nav, Navbar } from "react-bootstrap";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Header = () => {
    const { data: session } = useSession();

    const userSignIn = async () => {
        await signIn({ callbackUrl: '/'});
    };

    const userSignOut = async () => {
        await signOut({ callbackUrl: '/'});
    };

    if (session) {
        return (
            <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
                <Container>
                    <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} href="/budget">Budget</Nav.Link>
                            <Nav.Link as={Link} href="/income">Income</Nav.Link>
                            <Nav.Link as={Link} href="/history">History</Nav.Link>
                            <Nav.Link onClick={userSignOut}>Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    } else {
        return (
            <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
                <Container>
                    <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link onClick={userSignIn}>Login</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
};

export default Header;