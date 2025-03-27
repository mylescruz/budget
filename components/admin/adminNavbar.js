import { signOut } from "next-auth/react";
import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";

const AdminNavbar = () => {
    const logout = async () => {
        await signOut({ callbackUrl: '/'});
    };

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
                        <Nav.Link as={Link} href="/admin/users">Users</Nav.Link>
                        <Nav.Link onClick={logout}>Logout</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
};

export default AdminNavbar;