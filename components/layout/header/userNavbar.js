import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";

const UserNavbar = ({
  pages,
  session,
  navbarExpanded,
  linkClicked,
  toggleNavbar,
  userSignOut,
}) => {
  const userPages = pages.filter((page) => page.role === "User");

  const filteredPages = session.user.role === "User" ? userPages : pages;

  return (
    <Container>
      <Navbar.Brand href="/">Type-A Budget</Navbar.Brand>
      <Navbar.Toggle onClick={toggleNavbar} aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" in={navbarExpanded}>
        <Nav className="me-auto">
          {session.user.onboarded &&
            filteredPages.map((page, index) => (
              <Nav.Link
                key={index}
                as={Link}
                href={page.link}
                onClick={linkClicked}
              >
                {page.title}
              </Nav.Link>
            ))}
          <Nav.Link onClick={userSignOut}>Logout</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  );
};

export default UserNavbar;
