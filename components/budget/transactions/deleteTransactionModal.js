import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { BudgetContext } from "@/contexts/BudgetContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransactionModal = ({ chosenTransaction, modal, setModal }) => {
  const { budgetRequest, deleteTransaction } = useContext(BudgetContext);
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const closeDeleteModal = () => {
    setModal("transactionDetails");
  };

  const confirmDelete = async () => {
    setFormMeta({ status: "loading", error: null });

    try {
      await deleteTransaction(chosenTransaction);

      setModal("none");

      setFormMeta({ status: "idle", error: null });
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
      return;
    }
  };

  return (
    <Modal
      show={modal === "deleteTransaction"}
      onHide={closeDeleteModal}
      centered
    >
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>Delete Transaction</Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete this transaction?</p>
            {formMeta.error && <ErrorMessage message={formMeta.error} />}
          </Modal.Body>
          <Modal.Footer className="d-flex flex-row justify-content-between">
            <Button variant="secondary" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message={budgetRequest.message} />
      )}
    </Modal>
  );
};

export default DeleteTransactionModal;
