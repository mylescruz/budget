import { Container, Nav, Navbar } from "react-bootstrap";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import AdminNavbar from "../admin/adminNavbar";

const Header = () => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    // A user accesses the login page using the signIn function provided by NextAuth.js
    const userSignIn = async () => {
        await signIn({ callbackUrl: '/'});
    };

    // A user is logged out using the signOut function provided by NextAuth.js
    const userSignOut = async () => {
        await signOut({ callbackUrl: '/'});
    };

    if (session) {
        if (session.user.role === "Administrator")
            return <AdminNavbar />;
        else
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
                                <Nav.Link as={Link} href="/account">Account</Nav.Link>
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