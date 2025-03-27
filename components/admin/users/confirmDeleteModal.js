import { Modal, Row, Col, Button } from "react-bootstrap";

const ConfirmDeleteModal = ({ user, confirmDelete, setConfirmDelete, deleteUser }) => {
    const closeConfirmDelete = () => {
        setConfirmDelete(false);
    };

    const removeUser = () => {
        deleteUser(user);
    };

    return (
        <Modal show={confirmDelete} onHide={closeConfirmDelete} centered>
            <Modal.Body>
                Are you sure you want to delete this contact?
            </Modal.Body>
            <Modal.Footer>
                <Row className="text-end">
                    <Col><Button variant="secondary" onClick={closeConfirmDelete}>Cancel</Button></Col>
                    <Col><Button variant="danger" onClick={removeUser}>Delete</Button></Col>
                </Row>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;