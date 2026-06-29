import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { REQUEST_STATUS } from "@/lib/constants/requests";
import { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteDebtModal = ({ debt, deleteDebt, reqStatus, modal, setModal }) => {
  const [form, setForm] = useState({
    status: REQUEST_STATUS.IDLE,
    error: null,
  });

  const closeDeleteModal = () => {
    setModal(null);
  };

  const confirmDeleteDebt = async () => {
    try {
      setForm({ status: REQUEST_STATUS.LOADING, error: null });

      await deleteDebt(debt._id);

      setModal(null);
    } catch (error) {
      setForm({ status: REQUEST_STATUS.IDLE, error: error.message });
    }
  };

  return (
    <Modal show={modal === "DELETE"} onHide={closeDeleteModal} centered>
      {form.status === REQUEST_STATUS.IDLE && (
        <>
          <Modal.Header closeButton>Delete Debt</Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to delete your debt through {debt.lender}?
            </p>
            {form.error && <ErrorMessage message={form.error} />}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteDebt}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      )}
      {form.status === REQUEST_STATUS.LOADING && (
        <LoadingMessage message={reqStatus.message} />
      )}
    </Modal>
  );
};

export default DeleteDebtModal;
