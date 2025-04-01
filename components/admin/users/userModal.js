import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const UserModal = ({ user, userClicked, setUserClicked, putUser, setConfirmDelete }) => {
    const validated = {
        valid: true,
        error: ''
    };

    const [edittedUser, setEdittedUser] = useState(user);
    const [validEmail, setValidEmail] = useState(validated);
    const [validUsername, setValidUsername] = useState(validated);

    const closeUserModal = () => {
        setUserClicked(false);
        setEdittedUser(user);
        setValidEmail(validated);
        setValidUsername(validated);
    };

    const handleInput = (e) => {
        setEdittedUser({...edittedUser, [e.target.id]: e.target.value});
    };

    const checkEmail = (email) => {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
        return regex.test(email);
    };

    const editUser = async (e) => {
        e.preventDefault();

        // Check if entered email is valid
        if (!checkEmail(edittedUser.email)) {
            setValidEmail({valid: false, error: 'Not a valid email address'});
            return;
        } else {
            setValidEmail(validated);
        }

        // Update the user
        await putUser(edittedUser);

        setEdittedUser(edittedUser);
        setValidEmail(validated);
        setValidUsername(validated);
        setUserClicked(false);
    };

    const openConfirmDelete = () => {
        setUserClicked(false);
        setConfirmDelete(true);
    };

    return (
        <Modal show={userClicked} onHide={closeUserModal} centered>
            <Modal.Header closeButton><h4 className="m-0">{user.name}</h4></Modal.Header>
            <Form onSubmit={editUser}>
                <Modal.Body>
                    <Form.Group controlId="username" className="my-2">
                        <Row className="d-flex align-items-center">
                            <Col className="col-12 col-sm-2"><Form.Label>Username</Form.Label></Col>
                            <Col className="col-12 col-sm-10"><Form.Control type="text" value={edittedUser.username} disabled /></Col>
                            <Form.Control.Feedback type="invalid"><p>{validUsername.error}</p></Form.Control.Feedback>
                        </Row>
                    </Form.Group>
                    <Form.Group controlId="email" className="my-2">
                        <Row className="d-flex align-items-center">
                            <Col className="col-12 col-sm-2"><Form.Label>Email</Form.Label></Col>
                            <Col className="col-12 col-sm-10"><Form.Control type="text" value={edittedUser.email} onChange={handleInput} isInvalid={validEmail.error && !validEmail.valid} required /></Col>
                        </Row>
                        <Form.Control.Feedback type="invalid">{validEmail.error}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group controlId="role" className="my-2">
                        <Row className="d-flex align-items-center">
                            <Col className="col-12 col-sm-2"><Form.Label>Role</Form.Label></Col>
                            <Col className="col-12 col-sm-10">
                                <Form.Select type="text" value={edittedUser.role} onChange={handleInput} required>
                                    <option value="Administrator">Administrator</option>
                                    <option value="User">User</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Form.Group controlId="created-date" className="my-2">
                        <Row className="d-flex align-items-center">
                            <Col className="col-12 col-sm-2"><Form.Label>Created</Form.Label></Col>
                            <Col className="col-12 col-sm-10"><Form.Control type="text" value={edittedUser.created_date} disabled /></Col>
                        </Row>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="">
                    <Row className="d-flex w-100">
                        <Col className="d-none d-md-block col-md-4">
                            <Button className="btn-sm" variant="danger" onClick={openConfirmDelete}>Delete User</Button>
                        </Col>
                        <Col className="col-6 text-start col-md-4 text-md-end">
                            <Button className="btn-sm" variant="secondary" onClick={closeUserModal}>Cancel</Button>
                        </Col>
                        <Col className="col-6 col-md-4 text-end">
                            <Button className="btn-sm" variant="primary" type="submit">Save Changes</Button>
                        </Col>
                    </Row>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserModal;