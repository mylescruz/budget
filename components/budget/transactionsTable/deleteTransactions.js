import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import deleteTransactionFromCategoryActual from "@/helpers/deleteTransactionFromCategoryActual";
import { useContext } from "react";
import { Button, Modal } from "react-bootstrap";

const DeleteTransaction = ({
  transaction,
  showDelete,
  setShowDelete,
  setShowDetails,
}) => {
  const { categories, putCategories } = useContext(CategoriesContext);
  const { deleteTransaction } = useContext(TransactionsContext);

  const closeDelete = () => {
    setShowDelete(false);
    setShowDetails(true);
  };

  const confirmDelete = () => {
    // Deletes a transaction from the transactions array by sending a DELETE request to the API
    deleteTransaction(transaction);

    // Updates the categories array with the new category actual value by sending a DELETE request to the API
    const updatedCategories = deleteTransactionFromCategoryActual(
      transaction,
      categories
    );
    putCategories(updatedCategories);
  };

  return (
    <Modal show={showDelete} onHide={closeDelete} centered>
      <Modal.Header closeButton>Delete Transaction</Modal.Header>
      <Modal.Body>Are you sure you want to delete this transaction?</Modal.Body>
      <Modal.Footer>
        <Button variant="info" onClick={closeDelete}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirmDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteTransaction;
