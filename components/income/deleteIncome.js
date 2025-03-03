import deleteIncomeFromHistoryBudget from "@/helpers/deleteIncomeFromHistoryBudget";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { Button, Modal } from "react-bootstrap";

const DeleteIncome = ({ paycheck, deleteIncome, showDelete, setShowDelete, setShowDetails }) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    const { history, putHistory } = useHistory(session.user.username);

    const closeDelete = () => {
        setShowDelete(false);
        setShowDetails(true);
    };

    const confirmDelete = () => {
        // Deletes a paycheck from the income array by sending a DELETE request to the API
        deleteIncome(paycheck);

        // Updates the budget value for the given month in the history array by sending a PUT request to the API
        const paycheckMonth = deleteIncomeFromHistoryBudget(paycheck, history);
        putHistory(paycheckMonth);
    };

    return (
        <Modal show={showDelete} onHide={closeDelete} centered>
            <Modal.Header closeButton>Delete Paycheck</Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this paycheck?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={closeDelete}>Cancel</Button>
                <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteIncome;