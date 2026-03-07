import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/ui/loadingMessage";
import ErrorMessage from "@/components/ui/errorMessage";
import EditExpenseForm from "./editExpenseForm";
import EditTransferForm from "./editTransferForm";

const EditTransactionModal = ({
  chosenTransaction,
  dateInfo,
  modal,
  setModal,
}) => {
  const { getCategories } = useContext(CategoriesContext);
  const { putTransaction } = useContext(TransactionsContext);

  const [transaction, setTransaction] = useState(chosenTransaction);
  const [status, setStatus] = useState("editing");

  const closeEditModal = () => {
    setModal("transactionDetails");
  };

  const handleInput = (e) => {
    setTransaction({
      ...transaction,
      [e.target.id]: e.target.value,
    });
  };

  const editTheTransaction = async (e) => {
    setStatus("updating");

    try {
      e.preventDefault();

      const formattedAmount = Number(transaction.amount);

      if (isNaN(formattedAmount)) {
        throw new Error("Invalid amount entered");
      }

      await putTransaction({
        ...transaction,
        amount: formattedAmount,
      });

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      setModal("none");

      setStatus("editing");
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={modal === "editTransaction"} onHide={closeEditModal} centered>
      {status !== "updating" && (
        <>
          <Modal.Header>
            <Modal.Title>Edit Transaction Details</Modal.Title>
          </Modal.Header>
          <Form onSubmit={editTheTransaction}>
            <Modal.Body>
              {transaction.type === "Expense" && (
                <EditExpenseForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  handleInput={handleInput}
                />
              )}
              {transaction.type === "Transfer" && (
                <EditTransferForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  handleInput={handleInput}
                />
              )}
              {status === "error" && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="text-nowrap">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {status === "updating" && (
        <LoadingMessage message="Updating this transaction" />
      )}
    </Modal>
  );
};

export default EditTransactionModal;
