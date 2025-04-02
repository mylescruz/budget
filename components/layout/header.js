import { Container, Nav, Navbar } from "react-bootstrap";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import AdminNavbar from "../admin/adminNavbar";
import { useState } from "react";

const Header = () => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    // State object to collapse navbar on click
    const [navbarExpanded, setNavbarExpanded] = useState(false);

    // A user accesses the login page using the signIn function provided by NextAuth.js
    const userSignIn = async () => {
        setNavbarExpanded(false);
        await signIn({ callbackUrl: '/'});
    };

    // A user is logged out using the signOut function provided by NextAuth.js
    const userSignOut = async () => {
        setNavbarExpanded(false);
        await signOut({ callbackUrl: '/'});
    };

    const toggleNavbar = () => {
        setNavbarExpanded(!navbarExpanded);
    };
    
    const linkClicked = () => {
        setNavbarExpanded(false);
    };

    if (session) {
        if (session.user.role === "Administrator")
            return <AdminNavbar />;
        else
            return (
                <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
                    <Container>
                        <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
                        <Navbar.Toggle onClick={toggleNavbar} aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" in={navbarExpanded}>
                            <Nav className="me-auto">
                                <Nav.Link as={Link} href="/budget" onClick={linkClicked}>Budget</Nav.Link>
                                <Nav.Link as={Link} href="/income" onClick={linkClicked}>Income</Nav.Link>
                                <Nav.Link as={Link} href="/history" onClick={linkClicked}>History</Nav.Link>
                                <Nav.Link as={Link} href="/account" onClick={linkClicked}>Account</Nav.Link>
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
                    <Navbar.Toggle onClick={toggleNavbar} aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" in={navbarExpanded}>
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