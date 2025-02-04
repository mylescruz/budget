import { Container, Nav, Navbar } from "react-bootstrap";
import Link from "next/link";

const Header = () => {
    return (
        <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
        <Container>
            <Navbar.Brand href="/">Type-A Budgeting</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link as={Link} href="/budget">Budget</Nav.Link>
                <Nav.Link as={Link} href="/income">Income</Nav.Link>
                <Nav.Link as={Link} href="/history">History</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
    );
};

export default Header;