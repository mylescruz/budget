import { Button, Modal } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import { useContext, useState } from "react";
import { PaychecksContext } from "@/contexts/PaychecksContext";

const DeletePaycheckModal = ({
  paycheck,
  showDelete,
  setShowDelete,
  setShowDetails,
}) => {
  const { deletePaycheck } = useContext(PaychecksContext);

  const [deletingPaycheck, setDeletingPaycheck] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDelete = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = async () => {
    setDeletingPaycheck(true);

    try {
      // Deletes a paycheck from the income array by sending a DELETE request to the API
      await deletePaycheck(paycheck);

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingPaycheck(false);
    }
  };

  return (
    <Modal show={showDelete} onHide={closeDelete} centered>
      {!deletingPaycheck ? (
        <>
          <Modal.Header closeButton>Delete Paycheck</Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              Are you sure you want to delete this paycheck?
            </p>
            {errorOccurred && <ErrorMessage />}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="info" onClick={closeDelete}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <LoadingMessage message="Deleting the paycheck" />
      )}
    </Modal>
  );
};

export default DeletePaycheckModal;
