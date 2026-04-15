import ErrorMessage from "@/components/ui/errorMessage";
import LoadingMessage from "@/components/ui/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { useContext, useState } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransactionModal = ({ chosenTransaction, modal, setModal }) => {
  const { updateCategoriesFromTransaction } = useContext(CategoriesContext);
  const { transactionsRequest, deleteTransaction } =
    useContext(TransactionsContext);
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });

  const closeDeleteModal = () => {
    setModal("transactionDetails");
  };

  const confirmDelete = async () => {
    setFormMeta({ status: "loading", error: null });

    try {
      // Deletes a transaction from the transactions array by sending a DELETE request to the API
      await deleteTransaction(chosenTransaction._id);

      // Update the correlating category's state in the categories table
      updateCategoriesFromTransaction({
        oldTransaction: chosenTransaction,
        newTransaction: null,
      });

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
        <LoadingMessage message={transactionsRequest.message} />
      )}
    </Modal>
  );
};

export default DeleteTransactionModal;
