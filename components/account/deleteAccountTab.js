import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button, Col, Form, Modal } from "react-bootstrap";
import LoadingMessage from "../ui/loadingMessage";
import ErrorMessage from "../ui/errorMessage";

const DeleteAccountTab = ({ user, deleteUser, userRequest }) => {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const handleInput = (e) => {
    setPassword(e.target.value);
  };

  const closeConfirmDelete = () => {
    setConfirmDelete(false);

    setFormMeta({ status: "idle", error: null });
  };

  const confirmation = (e) => {
    e.preventDefault();

    setConfirmDelete(true);
  };

  const removeAccount = async () => {
    setFormMeta({ status: "loading", error: null });

    try {
      const userToDelete = { ...user, password: password };

      await deleteUser(userToDelete);

      window.alert("Your account has been deleted! Sorry to see you go!");

      signOut();

      setFormMeta({ status: "idle", error: null });
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
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
        {formMeta.status === "idle" && (
          <>
            <Modal.Header>
              <Modal.Title>Confirm Account Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2">
                Are you sure you want to delete your account and all of its
                data?
              </p>
              {formMeta.error && <ErrorMessage message={formMeta.error} />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeConfirmDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={removeAccount}>
                Delete
              </Button>
            </Modal.Footer>
          </>
        )}
        {formMeta.status === "loading" && (
          <LoadingMessage message={userRequest.message} />
        )}
      </Modal>
    </>
  );
};

export default DeleteAccountTab;
