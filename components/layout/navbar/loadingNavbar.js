import { Container, Navbar } from "react-bootstrap";

const LoadingNavbar = () => {
  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default LoadingNavbar;
