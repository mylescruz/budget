import { useState } from "react";
import CreateUserForm from "./createUserForm";
import { useRouter } from "next/router";
import { Button, Modal, Spinner } from "react-bootstrap";
import { signIn } from "next-auth/react";

const CreateUserLayout = ({ csrfToken }) => {
  const router = useRouter();

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [modal, setModal] = useState("none");

  const closeLoadingModal = () => {
    setModal("none");
  };

  const closeErrorModal = () => {
    setModal("none");
  };

  const closeLoginModal = () => {
    router.push("/auth/signIn");

    setModal("none");
  };

  // Complete the user creation by adding the user's details to the database
  const createUser = async () => {
    // Add all the users information in the onboarding API endpoint
    try {
      await fetch("/api/createUser", {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
    } catch (error) {
      setModal("error");
      return;
    }

    // Once the user is created, log the user in with the new credentials
    try {
      const response = await signIn("credentials", {
        username: newUser.username,
        password: newUser.password,
        redirect: false,
        csrfToken,
      });

      // Take user to the home page after signing in
      if (response.ok) {
        router.push("/onboarding");
      } else {
        throw new Error();
      }

      closeLoadingModal();
    } catch (error) {
      setModal("login");
    }
  };

  return (
    <>
      <CreateUserForm
        newUser={newUser}
        setNewUser={setNewUser}
        setModal={setModal}
        createUser={createUser}
      />

      <Modal show={modal === "loading"} onHide={closeLoadingModal} centered>
        <Modal.Body className="text-center">
          <h3>Creating your new account!</h3>
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={modal === "error"} onHide={closeErrorModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger fw-bold">
            Error Occurred
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center fw-bold text-danger">
          <p>An error occurred while creating your account.</p>
          <p>Please try again later!</p>
        </Modal.Body>
      </Modal>

      <Modal show={modal === "login"} onHide={closeLoginModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Login Error</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center fw-bold">
          <p>There was an issue with direct login.</p>
          <p>Please sign in using your new credentials below.</p>
          <Button variant="primary" onClick={closeLoginModal}>
            Login
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateUserLayout;
