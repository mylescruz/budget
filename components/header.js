import { Container, Nav, Navbar } from "react-bootstrap";

const Header = () => {
    return (
        <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top">
        <Container>
            <Navbar.Brand href="#home">Type-A Budgeting</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <Nav.Link href="#link">Budget</Nav.Link>
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
    );
};

export default Header;