import { Container, Nav, Navbar } from "react-bootstrap";

const Footer = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark" fixed="bottom" className="mt-3">
        <Container>
          <Nav className="ms-auto">
            <Nav.Link href="https://mylescruz.com/">© 2024 Myles Cruz</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
};

export default Footer;