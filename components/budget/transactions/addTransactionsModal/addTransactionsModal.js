import { useContext, useState } from "react";
import { Form, Button, Modal } from "react-bootstrap";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import todayInfo from "@/helpers/todayInfo";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/ui/loadingMessage";
import {
  TRANSACTION_TYPES,
  TRANSACTION_TYPES_LIST,
  TRANSFER_ACCOUNTS,
} from "@/lib/constants/transactions";
import AddExpenseForm from "./addExpenseForm";
import AddTransferForm from "./addTransferForm";
import styles from "@/styles/transactions/addTransactionsModal.module.css";

const AddTransactionsModal = ({ dateInfo, modal, setModal }) => {
  const { categories, updateCategoriesFromTransaction } =
    useContext(CategoriesContext);
  const { postTransactions } = useContext(TransactionsContext);

  // Get a list of all the variable category names
  const categoryNames = [];

  categories.forEach((category) => {
    if (!category.fixed) {
      if (category.subcategories.length === 0) {
        categoryNames.push(category.name);
      } else {
        category.subcategories.forEach((subcategory) => {
          categoryNames.push(subcategory.name);
        });
      }
    }
  });

  // Make the user's first category choice the first variable category name
  const firstVariableChoice = categoryNames[0];

  // Set the date for a new transaction either the current date or the first of the month based on if the user is looking at their current budget or a previous/future budget
  const transactionDate =
    todayInfo.month === dateInfo.month && todayInfo.year === dateInfo.year
      ? todayInfo.date
      : dateInfo.startOfMonth;

  const newExpense = {
    active: true,
    type: TRANSACTION_TYPES.EXPENSE,
    date: transactionDate,
    store: "",
    items: "",
    category: firstVariableChoice,
    amount: "",
  };

  const newTransfer = {
    active: true,
    type: TRANSACTION_TYPES.TRANSFER,
    date: transactionDate,
    fromAccount: TRANSFER_ACCOUNTS.CHECKING,
    toAccount: TRANSFER_ACCOUNTS.SAVINGS,
    amount: "",
    description: "",
  };

  const [newTransactions, setNewTransactions] = useState([{ ...newExpense }]);
  const [formMeta, setFormMeta] = useState({
    status: "idle", // idle | loading | error
    error: null,
  });

  // Change the type of a transaction in the transactions array
  const handleType = (e, index) => {
    const type = e.target.value;

    setNewTransactions((prev) => {
      return prev.map((transaction, transactionIndex) => {
        if (index === transactionIndex) {
          if (type === TRANSACTION_TYPES.EXPENSE) {
            return { ...newExpense };
          } else {
            return { ...newTransfer };
          }
        } else {
          return transaction;
        }
      });
    });
  };

  const handleInput = (e, index) => {
    const { id, value } = e.target;

    setNewTransactions((prev) => {
      return prev.map((transaction, transactionIndex) => {
        if (index === transactionIndex) {
          return {
            ...transaction,
            [id]: value,
          };
        } else {
          return transaction;
        }
      });
    });
  };

  const closeAddModal = () => {
    setNewTransactions([{ ...newExpense }]);
    setModal("none");
  };

  const addNewTransaction = () => {
    // Check if all fields have user input before allowing another transaction to be added
    let allComplete = true;

    const checkedTransactions = newTransactions.map((transaction) => {
      let transactionComplete = true;

      Object.values(transaction).forEach((value) => {
        if (value === "") {
          transactionComplete = false;
          allComplete = false;
        }
      });

      if (transactionComplete) {
        return { ...transaction, active: false };
      } else {
        return { ...transaction, active: true };
      }
    });

    // Make sure the previous transaction is complete before adding a new transaction
    if (!allComplete) {
      setNewTransactions(checkedTransactions);
      setFormMeta({
        status: "idle",
        error: "Please fill out all the empty fields",
      });
      return;
    }

    // Add the new transaction and close the other transactions
    setNewTransactions((prev) => {
      const updatedTransactions = [...prev].map((transaction) => {
        return { ...transaction, active: false };
      });

      updatedTransactions.push({ ...newExpense });

      return updatedTransactions;
    });
  };

  // Show only one transaction at a time for input
  const editNewTransaction = (index) => {
    setNewTransactions((prev) => {
      return prev.map((transaction, transactionIndex) => {
        if (index === transactionIndex) {
          return { ...transaction, active: true };
        } else {
          return { ...transaction, active: false };
        }
      });
    });
  };

  // Delete the selected new transaction and make the latest transaction active
  const deleteNewTransaction = (index) => {
    setNewTransactions((prev) => {
      return prev
        .filter((transaction, transactionIndex) => index !== transactionIndex)
        .map((transaction, transactionIndex) => {
          if (prev.length - 2 === transactionIndex) {
            return { ...transaction, active: true };
          } else {
            return { ...transaction, active: false };
          }
        });
    });
  };

  const submitTransactions = async (e) => {
    e.preventDefault();

    setFormMeta((prev) => ({ ...prev, status: "loading" }));

    try {
      // Adds the new transaction and updates the correlating category in MongoDB
      const addedTransactions = await postTransactions(newTransactions);

      // Update the correlating category's state in the categories table
      addedTransactions.forEach((transaction) => {
        updateCategoriesFromTransaction({
          oldTransaction: null,
          newTransaction: transaction,
        });
      });

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
            <Modal.Title>Enter new transactions</Modal.Title>
          </Modal.Header>

          <Form onSubmit={submitTransactions}>
            <Modal.Body>
              <div className="w-100 d-flex flex-column">
                {newTransactions.map((newTransaction, index) => (
                  <div key={index} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <h5 className="my-0">Transaction {index + 1}</h5>
                      <div className="d-flex w-25 justify-content-between">
                        {!newTransaction.active ? (
                          <i
                            className={`fs-6 bi bi-pencil-square ${styles.edit}`}
                            onClick={() => editNewTransaction(index)}
                          />
                        ) : (
                          <div />
                        )}
                        {newTransactions.length > 1 ? (
                          <i
                            className={`fs-6 bi bi-trash ${styles.delete}`}
                            onClick={() => deleteNewTransaction(index)}
                          />
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                    <div
                      className={
                        newTransaction.active ? "d-flex flex-column" : "d-none"
                      }
                    >
                      <Form.Group controlId="type" className="my-2">
                        <Form.Label>
                          What type of transaction is this?{" "}
                          <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          className="h-100"
                          value={newTransaction.type}
                          onChange={(e) => handleType(e, index)}
                          required
                        >
                          {TRANSACTION_TYPES_LIST.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                      {newTransaction.type === TRANSACTION_TYPES.EXPENSE && (
                        <AddExpenseForm
                          dateInfo={dateInfo}
                          transaction={newTransaction}
                          handleInput={handleInput}
                          index={index}
                        />
                      )}
                      {newTransaction.type === TRANSACTION_TYPES.TRANSFER && (
                        <AddTransferForm
                          dateInfo={dateInfo}
                          transaction={newTransaction}
                          handleInput={handleInput}
                          index={index}
                        />
                      )}
                    </div>
                    <hr />
                  </div>
                ))}
                <Button onClick={addNewTransaction}>
                  Add Another Transaction
                </Button>
              </div>
              {formMeta.error && (
                <p className="my-2 text-center text-danger">{formMeta.error}</p>
              )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeAddModal}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Add All
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage
          message={`Adding the new transaction${newTransactions.length > 1 ? "s" : ""}`}
        />
      )}
    </Modal>
  );
};

export default AddTransactionsModal;
