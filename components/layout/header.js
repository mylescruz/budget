import { Container, Nav, Navbar } from "react-bootstrap";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import AdminNavbar from "./navbar/adminNavbar";
import { useState } from "react";
import LoadingNavbar from "./navbar/loadingNavbar";
import LoginNavbar from "./navbar/loginNavbar";
import UserNavbar from "./navbar/userNavbar";

const Header = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session, status } = useSession();

  // State object to collapse navbar on click
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  // A user accesses the login page using the signIn function provided by NextAuth.js
  const userSignIn = async () => {
    setNavbarExpanded(false);
    await signIn({ callbackUrl: "/" });
  };

  // A user is logged out using the signOut function provided by NextAuth.js
  const userSignOut = async () => {
    setNavbarExpanded(false);
    await signOut({ callbackUrl: "/" });
  };

  const toggleNavbar = () => {
    setNavbarExpanded(!navbarExpanded);
  };

  const linkClicked = () => {
    setNavbarExpanded(false);
  };

  if (status === "loading") {
    return <LoadingNavbar />;
  } else if (status === "unauthenticated") {
    return (
      <LoginNavbar
        navbarExpanded={navbarExpanded}
        toggleNavbar={toggleNavbar}
        userSignIn={userSignIn}
      />
    );
  } else if (session) {
    if (session.user.role === "Administrator") {
      return (
        <AdminNavbar
          navbarExpanded={navbarExpanded}
          toggleNavbar={toggleNavbar}
          linkClicked={linkClicked}
          userSignOut={userSignOut}
        />
      );
    } else if (status === "unauthenticated") {
      return (
        <LoginNavbar
          navbarExpanded={navbarExpanded}
          toggleNavbar={toggleNavbar}
          userSignIn={userSignIn}
        />
      );
    } else {
      return (
        <UserNavbar
          navbarExpanded={navbarExpanded}
          toggleNavbar={toggleNavbar}
          linkClicked={linkClicked}
          userSignOut={userSignOut}
        />
      );
    }
  } else {
    return (
      <LoginNavbar
        navbarExpanded={navbarExpanded}
        toggleNavbar={toggleNavbar}
        userSignIn={userSignIn}
      />
    );
  }
};

export default Header;
