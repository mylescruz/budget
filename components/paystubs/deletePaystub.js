import deleteFromHistoryBudget from "@/helpers/deleteFromHistoryBudget";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { Button, Modal } from "react-bootstrap";

const DeletePaystub = ({ paystub, deletePaystub, showDelete, setShowDelete, setShowDetails }) => {
    const { data: session } = useSession();

    const { history, putHistory } = useHistory(session.user.username);

    const closeDelete = () => {
        setShowDelete(false);
        setShowDetails(true);
    };

    const confirmDelete = () => {
        deletePaystub(paystub);

        const paystubMonth = deleteFromHistoryBudget(paystub, history);
        putHistory(paystubMonth);
    };

    return (
        <Modal show={showDelete} onHide={closeDelete} centered>
            <Modal.Header closeButton>Delete Paystub</Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this paystub?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={closeDelete}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeletePaystub;