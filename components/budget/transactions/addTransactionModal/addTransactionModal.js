import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import todayInfo from "@/helpers/todayInfo";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";
import {
  transactionTypes,
  transferAccounts,
} from "@/lib/constants/transactions";
import AddExpenseForm from "./addExpenseForm";
import AddTransferForm from "./addTransferForm";

const AddTransactionModal = ({ dateInfo, modal, setModal }) => {
  const { categories, getCategories } = useContext(CategoriesContext);
  const { postTransaction } = useContext(TransactionsContext);

  // When adding a new transaction, the first category option should be the first one that is not fixed and doesn't have a subcategory
  const firstNotFixed = categories.find((category) => {
    return !category.fixed && !category.subcategories.length > 0;
  });

  // Set the date for a new transaction either the current date or the first of the month based on if the user is looking at their current budget or a previous/future budget
  const transactionDate =
    todayInfo.month === dateInfo.month && todayInfo.year === dateInfo.year
      ? todayInfo.date
      : dateInfo.startOfMonth;

  const newExpense = {
    type: "Expense",
    date: transactionDate,
    store: "",
    items: "",
    category: firstNotFixed.name,
    amount: "",
  };

  const newTransfer = {
    type: "Transfer",
    date: transactionDate,
    fromAccount: transferAccounts[0],
    toAccount: transferAccounts[1],
    amount: "",
    description: "",
  };

  const [transaction, setTransaction] = useState(newExpense);
  const [formMeta, setFormMeta] = useState({
    status: "idle", // idle | loading | error
    error: null,
  });

  const handleType = (e) => {
    if (e.target.value === "Expense") {
      setTransaction(newExpense);
    } else {
      setTransaction(newTransfer);
    }
  };

  const handleInput = (e) => {
    setTransaction((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const closeAddModal = () => {
    setModal("none");
  };

  const AddNewTransaction = async (e) => {
    e.preventDefault();

    setFormMeta((prev) => ({ ...prev, status: "loading" }));

    try {
      // Adds the new transaction and updates the correlating category in MongoDB
      await postTransaction(transaction);

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      closeAddModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: true });
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={modal === "addTransaction"} onHide={closeAddModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter transaction information</Modal.Title>
          </Modal.Header>

          <Form onSubmit={AddNewTransaction}>
            <Modal.Body>
              <Form.Group controlId="type" className="my-2">
                <Form.Label>What type of transaction is this?</Form.Label>
                <Form.Select
                  className="h-100"
                  value={transaction.type}
                  onChange={handleType}
                  required
                >
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {transaction.type === "Expense" && (
                <AddExpenseForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  handleInput={handleInput}
                />
              )}
              {transaction.type === "Transfer" && (
                <AddTransferForm
                  dateInfo={dateInfo}
                  transaction={transaction}
                  handleInput={handleInput}
                />
              )}
              {formMeta.error && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeAddModal}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message="Adding the transaction" />
      )}
    </Modal>
  );
};

export default AddTransactionModal;
