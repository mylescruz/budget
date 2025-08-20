import { useState } from "react";
import CreateUserForm from "./createUserForm";
import OnboardingLayout from "./onboarding/onboardingLayout";
import { useRouter } from "next/router";
import { Modal, Spinner } from "react-bootstrap";
import { signIn } from "next-auth/react";

const CreateUserLayout = ({ csrfToken }) => {
  const router = useRouter();

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    categories: [],
    customCategories: false,
    paychecks: [],
  });
  const [createFormComplete, setCreateFormComplete] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  // Closes the loading screen modal for creating the user
  const closeCreatingUser = () => {
    setCreatingUser(false);
  };

  // Complete the onboarding by adding all the user's details to MongoDB
  const finishOnboarding = async () => {
    setCreatingUser(true);

    // Add all the users information in the onboarding API endpoint
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          Accept: "application.json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      closeCreatingUser();
      return;
    }

    // Once onboarded, log the user in with the new credentials
    try {
      const response = await signIn("credentials", {
        username: newUser.username,
        password: newUser.password,
        redirect: false,
        csrfToken,
      });

      // Take user to the home page after signing in
      if (response.ok) {
        router.push("/");
      } else {
        throw new Error(
          "There was an issue with directly login. Please sign in using your new credentials."
        );
      }

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      router.push("/auth/signIn");
    } finally {
      closeCreatingUser();
    }
  };

  // Props for the underlying components
  const createUserFormProps = {
    newUser: newUser,
    setNewUser: setNewUser,
    setCreateFormComplete: setCreateFormComplete,
    errorOccurred: errorOccurred,
    setErrorOccurred: setErrorOccurred,
  };

  const onboardingLayoutProps = {
    newUser: newUser,
    setNewUser: setNewUser,
    finishOnboarding: finishOnboarding,
  };

  return (
    <>
      {!createFormComplete ? (
        <CreateUserForm {...createUserFormProps} />
      ) : (
        <>
          <OnboardingLayout {...onboardingLayoutProps} />
        </>
      )}

      <Modal show={creatingUser} onHide={closeCreatingUser} centered>
        <Modal.Body>
          <h3 className="text-center">Creating your new account and budget!</h3>
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" variant="primary" />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreateUserLayout;
