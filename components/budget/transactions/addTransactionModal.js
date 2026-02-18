import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import todayInfo from "@/helpers/todayInfo";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import SelectCategoryOption from "./selectCategoryOption";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";

const AddTransactionModal = ({
  dateInfo,
  addTransactionClicked,
  setAddTransactionClicked,
}) => {
  const { categories, getCategories } = useContext(CategoriesContext);
  const { postTransaction } = useContext(TransactionsContext);

  // When adding a new transaction, the first category option should be the first one that is not fixed and doesn't have a subcategory
  const firstNotFixed = categories.find((category) => {
    return !category.fixed && !category.subcategories.length > 0;
  });

  // Set the date for a new transaction either the current date or the first of the month based on if the user is looking at their current budget or a previous/future budget
  const newTransactionDate =
    todayInfo.month === dateInfo.month ? todayInfo.date : dateInfo.startOfMonth;

  const emptyTransaction = {
    date: newTransactionDate,
    store: "",
    items: "",
    category: firstNotFixed.name,
    amount: "",
  };

  const [newTransaction, setTransaction] = useState(emptyTransaction);
  const [status, setStatus] = useState("inputting");

  const handleInput = (e) => {
    setTransaction({ ...newTransaction, [e.target.id]: e.target.value });
  };

  const closeModal = () => {
    setStatus("inputting");
    setAddTransactionClicked(false);
  };

  const AddNewTransaction = async (e) => {
    setStatus("posting");

    try {
      e.preventDefault();

      // Adds the new transaction and updates the correlating category in MongoDB
      await postTransaction(newTransaction);

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      setTransaction(emptyTransaction);
      closeModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  return (
    <Modal show={addTransactionClicked} onHide={closeModal} centered>
      {status !== "posting" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter transaction information</Modal.Title>
          </Modal.Header>

          <Form onSubmit={AddNewTransaction}>
            <Modal.Body>
              <Form.Group controlId="date" className="my-2">
                <Form.Label>Date of the transaction</Form.Label>
                <Form.Control
                  className="h-100"
                  type="date"
                  min={dateInfo.startOfMonth}
                  max={dateInfo.endOfMonth}
                  value={newTransaction.date}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group controlId="store" className="my-2">
                <Form.Label>Where did you shop?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="text"
                  value={newTransaction.store}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group controlId="items" className="my-2">
                <Form.Label>What did you purchase?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="text"
                  value={newTransaction.items}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group controlId="category" className="my-2">
                <Form.Label>
                  Which category does this transaction apply to?
                </Form.Label>
                <Form.Select
                  className="h-100"
                  value={newTransaction.category}
                  onChange={handleInput}
                  required
                >
                  {categories.map(
                    (category) =>
                      !category.fixed && (
                        <SelectCategoryOption
                          key={category._id}
                          category={category}
                        />
                      ),
                  )}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="amount" className="my-2">
                <Form.Label>How much did it cost?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              {status === "error" && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={closeModal}>
                Close
              </Button>
              <Button variant="primary" type="submit">
                Add
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {status === "posting" && (
        <LoadingMessage message="Adding the transaction" />
      )}
    </Modal>
  );
};

export default AddTransactionModal;
