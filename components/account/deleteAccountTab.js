import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const DeleteAccountTab = ({ user, deleteUser }) => {
  const [password, setPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    try {
      const userToDelete = { ...user, password: password };

      await deleteUser(userToDelete);

      window.alert("Your account has been deleted! Sorry to see you go!");

      signOut();
    } catch (error) {
      window.alert(error.message);
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
          Are you sure you want to delete your account and all of its data?
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
    </>
  );
};

export default DeleteAccountTab;
