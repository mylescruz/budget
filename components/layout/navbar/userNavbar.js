import Link from "next/link";
import { Container, Nav, Navbar } from "react-bootstrap";

const UserNavbar = ({
  session,
  navbarExpanded,
  linkClicked,
  toggleNavbar,
  userSignOut,
}) => {
  const pages = [
    { name: "Budget", link: "/budget" },
    { name: "Income", link: "/income" },
    { name: "Summary", link: "/summary" },
    { name: "Account", link: "/account" },
  ];

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
            {session.user.onboarded &&
              pages.map((page, index) => (
                <Nav.Link
                  key={index}
                  as={Link}
                  href={page.link}
                  onClick={linkClicked}
                >
                  {page.name}
                </Nav.Link>
              ))}
            <Nav.Link onClick={userSignOut}>Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
