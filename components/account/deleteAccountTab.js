import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import ErrorMessage from "../layout/errorMessage";
import LoadingMessage from "../layout/loadingMessage";

const DeleteAccountTab = ({ user, deleteUser }) => {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setPassword(e.target.value);
  };

  const closeConfirmDelete = () => {
    setConfirmDelete(false);
  };

  const confirmation = (e) => {
    e.preventDefault();

    setConfirmDelete(true);
  };

  const removeAccount = async () => {
    setDeletingUser(true);

    try {
      const userToDelete = { ...user, password: password };

      await deleteUser(userToDelete);

      window.alert("Your account has been deleted! Sorry to see you go!");

      setErrorOccurred(false);

      signOut();
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <>
      <Col className="col-12 col-md-8 col-lg-9">
        <h2>Delete Account</h2>
        <Form onSubmit={confirmation} className="col-12 col-md-8 col-lg-6">
          <Form.Group controlId="password" className="my-2">
            <Form.Label>
              In order to delete your account, you must enter your password
            </Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={handleInput}
              required
            />
          </Form.Group>
          <Form.Group className="my-2 text-end">
            <Button variant="danger" type="submit">
              Delete
            </Button>
          </Form.Group>
        </Form>
      </Col>

      <Modal show={confirmDelete} onHide={closeConfirmDelete} centered>
        <Modal.Body>
          <p className="mb-2">
            Are you sure you want to delete your account and all of its data?
          </p>
          {errorOccurred && <ErrorMessage />}
        </Modal.Body>
        <Modal.Footer>
          <Row className="text-end">
            <Col>
              <Button variant="secondary" onClick={closeConfirmDelete}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button variant="danger" onClick={removeAccount}>
                Delete
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>

      <Modal show={deletingUser} backdrop="static" centered>
        <LoadingMessage message="Deleting your account" />
      </Modal>
    </>
  );
};

export default DeleteAccountTab;
