import { Button, Modal } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import { useState } from "react";

const DeletePaycheckModal = ({
  paycheck,
  deletePaycheck,
  showDelete,
  setShowDelete,
  setShowDetails,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeDeleteModal = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = async () => {
    setConfirmingDelete(true);

    try {
      // Deletes a paycheck from the income array by sending a DELETE request to the API
      await deletePaycheck(paycheck);

      setShowDelete(false);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setConfirmingDelete(false);
    }
  };

  return (
    <Modal show={showDelete} onHide={closeDeleteModal} centered>
      {!confirmingDelete ? (
        <>
          <Modal.Header closeButton>Delete Paycheck</Modal.Header>
          <Modal.Body>
            <p className="mb-2">
              Are you sure you want to delete this paycheck?
            </p>
            {errorOccurred && <ErrorMessage />}
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="info" onClick={closeDeleteModal}>
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
