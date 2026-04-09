import { useState } from "react";
import CreateUserForm from "./createUserForm";
import { useRouter } from "next/router";
import { Button, Modal, Spinner } from "react-bootstrap";
import { signIn } from "next-auth/react";

const errorFields = {
  message: null,
  username: null,
  email: null,
  password: null,
  passwordMatch: null,
};

const CreateUserLayout = ({ csrfToken }) => {
  const router = useRouter();

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState(errorFields);
  const [modal, setModal] = useState("none");

  const closeLoadingModal = () => {
    setModal("none");
  };

  const autoLogin = async () => {
    try {
      const response = await signIn("credentials", {
        username: newUser.username,
        password: newUser.password,
        redirect: false,
        csrfToken,
      });

      if (!response.ok) {
        throw new Error(
          "There was an error logging you into your new account. Try logging in directly using our login page",
        );
      }

      // Take user to the home page after signing in
      router.push("/onboarding");
    } catch (error) {
      throw error;
    }
  };

  // Complete the user creation by adding the user's details to the database
  const createUser = async () => {
    // Add all the users information in the onboarding API endpoint
    try {
      const response = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message);
      }

      await autoLogin();
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, message: error.message }));
    } finally {
      closeLoadingModal();
    }
  };

  return (
    <>
      <CreateUserForm
        newUser={newUser}
        setNewUser={setNewUser}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
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
    </>
  );
};

export default CreateUserLayout;
