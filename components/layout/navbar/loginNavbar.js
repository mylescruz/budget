import { Container, Nav, Navbar } from "react-bootstrap";

const LoginNavbar = ({ navbarExpanded, toggleNavbar, userSignIn }) => {
  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
        <Navbar.Toggle
          onClick={toggleNavbar}
          aria-controls="basic-navbar-nav"
        />
        <Navbar.Collapse id="basic-navbar-nav" in={navbarExpanded}>
          <Nav className="me-auto">
            <Nav.Link onClick={userSignIn}>Login</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default LoginNavbar;
