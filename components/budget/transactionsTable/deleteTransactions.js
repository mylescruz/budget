import { Button, Modal } from "react-bootstrap";

const DeleteTransaction = ({ transaction, showDelete, setShowDelete, setShowDetails, removeTransaction}) => {
    const closeDelete = () => {
        setShowDelete(false);
        setShowDetails(true);
    };

    const confirmDelete = () => {
        removeTransaction(transaction);
    };

    return (
        <Modal show={showDelete} onHide={closeDelete} centered>
            <Modal.Header closeButton>Delete Transaction</Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this transaction?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={closeDelete}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteTransaction;