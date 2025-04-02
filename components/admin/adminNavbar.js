import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

const AdminNavbar = () => {
    // State object to collapse navbar on click
    const [navbarExpanded, setNavbarExpanded] = useState(false);

    const logout = async () => {
        setNavbarExpanded(false);
        await signOut({ callbackUrl: '/'});
    };

    const toggleNavbar = () => {
        setNavbarExpanded(!navbarExpanded);
    };
    
    const linkClicked = () => {
        setNavbarExpanded(false);
    };

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
                        <Nav.Link as={Link} href="/admin/users" onClick={linkClicked}>Users</Nav.Link>
                        <Nav.Link onClick={logout}>Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
};

export default AdminNavbar;