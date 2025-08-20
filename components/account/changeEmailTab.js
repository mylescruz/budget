import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Col, Form, Modal } from "react-bootstrap";
import ErrorModal from "../layout/errorModal";
import LoadingMessage from "../layout/loadingMessage";

const ChangeEmailTab = ({ user, putUser }) => {
  const oldUser = {
    ...user,
    currentPassword: "",
    newEmail: "",
  };

  // Error validation object that checks if an object is valid and returns an error if not
  const validated = {
    valid: true,
    error: "",
  };

  const router = useRouter();

  const [edittedUser, setEdittedUser] = useState(oldUser);
  const [validEmail, setValidEmail] = useState(validated);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setEdittedUser({ ...edittedUser, [e.target.id]: e.target.value });
  };

  const checkEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
    return regex.test(email);
  };

  // Does all the validation checks to make sure the given input matches all the criteria
  const updateEmail = async (e) => {
    e.preventDefault();

    // Check if entered email is valid
    if (!checkEmail(edittedUser.newEmail)) {
      setValidEmail({ valid: false, error: "Not a valid email address" });
      return;
    } else {
      setValidEmail(validated);
    }

    setUpdatingUser(true);

    try {
      // Update the user in the backend
      await putUser(edittedUser);

      setEdittedUser(oldUser);

      setErrorOccurred(false);

      router.reload();
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setUpdatingUser(false);
    }
  };

  return (
    <>
      <Col className="col-12 col-md-8 col-lg-9">
        <h2>Change Email</h2>

        <Form onSubmit={updateEmail} className="col-12 col-md-8 col-lg-6">
          <Form.Group controlId="email" className="my-2">
            <Form.Label>Current Email</Form.Label>
            <Form.Control type="text" value={edittedUser.email} disabled />
          </Form.Group>
          <Form.Group controlId="newEmail" className="my-2">
            <Form.Label>Enter New Email</Form.Label>
            <Form.Control
              type="text"
              value={edittedUser.newEmail}
              onChange={handleInput}
              required
              isInvalid={validEmail.error && !validEmail.valid}
            />
            <Form.Control.Feedback type="invalid">
              {validEmail.error}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="currentPassword" className="my-2">
            <Form.Label>Enter Password</Form.Label>
            <Form.Control
              type="password"
              value={edittedUser.currentPassword}
              onChange={handleInput}
              required
            />
          </Form.Group>

          <Form.Group className="my-2 text-end">
            <Button type="submit">Change</Button>
          </Form.Group>
        </Form>
      </Col>

      <Modal show={updatingUser} backdrop="static" centered>
        <LoadingMessage message="Updating the user's email" />
      </Modal>

      <ErrorModal
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
      />
    </>
  );
};

export default ChangeEmailTab;
