import { Navbar } from "react-bootstrap";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import LoadingNavbar from "./loadingNavbar";
import LoginNavbar from "./loginNavbar";
import UserNavbar from "./userNavbar";

const pages = [
  { title: "Budget", link: "/budget", role: "User" },
  { title: "Income", link: "/income", role: "User" },
  { title: "Summary", link: "/summary", role: "User" },
  { title: "Account", link: "/account", role: "User" },
  { title: "Users", link: "/admin/users", role: "Administrator" },
];

const HeaderLayout = () => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session, status } = useSession();

  // State object to collapse navbar on click
  const [navbarExpanded, setNavbarExpanded] = useState(false);

  const linkClicked = () => {
    setNavbarExpanded(false);
  };

  const toggleNavbar = () => {
    setNavbarExpanded((prev) => !prev);
  };

  // User logs in using the NextAuth signIn function
  const userSignIn = async () => {
    linkClicked();

    await signIn({ callbackUrl: "/" });
  };

  // User logs out using the NextAuth signOut function
  const userSignOut = async () => {
    linkClicked();

    await signOut({ callbackUrl: "/" });
  };

  return (
    <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
      {status === "loading" && <LoadingNavbar />}
      {status === "unauthenticated" && (
        <LoginNavbar
          navbarExpanded={navbarExpanded}
          toggleNavbar={toggleNavbar}
          userSignIn={userSignIn}
        />
      )}
      {status === "authenticated" && (
        <UserNavbar
          pages={pages}
          session={session}
          navbarExpanded={navbarExpanded}
          toggleNavbar={toggleNavbar}
          linkClicked={linkClicked}
          userSignOut={userSignOut}
        />
      )}
    </Navbar>
  );
};

export default HeaderLayout;
