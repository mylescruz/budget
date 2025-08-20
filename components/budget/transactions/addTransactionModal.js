import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import dateInfo from "@/helpers/dateInfo";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import SelectCategoryOption from "./selectCategoryOption";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";

const AddTransactionModal = ({
  monthInfo,
  addTransactionClicked,
  setAddTransactionClicked,
}) => {
  const { categories, getCategories } = useContext(CategoriesContext);
  const { postTransaction } = useContext(TransactionsContext);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  // When adding a new transaction, the first category option should be the first one that is not fixed and doesn't have a subcategory
  const firstNotFixed = categories.find((category) => {
    return !category.fixed && !category.hasSubcategory;
  });

  // Set the date for a new transaction either the current date or the first of the month based on if the user is looking at current budget or history
  const newTransactionDate =
    dateInfo.currentMonth === monthInfo.month
      ? dateInfo.currentDate
      : monthInfo.startOfMonthDate;

  const emptyTransaction = {
    date: newTransactionDate,
    store: "",
    items: "",
    category: firstNotFixed.name,
    amount: "",
  };

  const [newTransaction, setTransaction] = useState(emptyTransaction);

  const handleInput = (e) => {
    setTransaction({ ...newTransaction, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") {
      setTransaction({ ...newTransaction, amount: input });
    } else {
      setTransaction({ ...newTransaction, amount: parseFloat(input) });
    }
  };

  const AddNewTransaction = async (e) => {
    setAddingTransaction(true);

    try {
      e.preventDefault();

      // Adds the new transaction and updates the correlating category in MongoDB
      await postTransaction(newTransaction);

      // Fetch the categories to update the state for the categories table
      await getCategories(monthInfo.monthNumber, monthInfo.year);

      setTransaction(emptyTransaction);
      setAddTransactionClicked(false);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setAddingTransaction(false);
    }
  };

  const closeModal = () => {
    setTransaction(emptyTransaction);
    setAddTransactionClicked(false);
  };

  return (
    <Modal show={addTransactionClicked} onHide={closeModal} centered>
      {!addingTransaction ? (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Enter transaction information</Modal.Title>
          </Modal.Header>

          <Form onSubmit={AddNewTransaction}>
            <Modal.Body>
              <Row className="d-flex">
                <Col className="col-12 col-md-4">
                  <Form.Group controlId="date" className="my-2">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      className="h-100"
                      type="date"
                      min={monthInfo.startOfMonthDate}
                      max={monthInfo.endOfMonthDate}
                      value={newTransaction.date}
                      onChange={handleInput}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col className="col-12 col-md-8">
                  <Form.Group controlId="store" className="my-2">
                    <Form.Label>Store/Restaurant</Form.Label>
                    <Form.Control
                      className="h-100"
                      type="text"
                      value={newTransaction.store}
                      onChange={handleInput}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="items" className="my-2">
                <Form.Label>What was purchased?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="text"
                  value={newTransaction.items}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Row className="d-flex">
                <Col className="col-12 col-md-6">
                  <Form.Group controlId="category" className="my-2">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      className="h-100"
                      value={newTransaction.category}
                      onChange={handleInput}
                      required
                    >
                      <option disabled>Choose a Category...</option>
                      {categories.map(
                        (category) =>
                          !category.fixed && (
                            <SelectCategoryOption
                              key={category.id}
                              category={category}
                            />
                          )
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col className="col-12 col-md-6">
                  <Form.Group controlId="amount" className="my-2">
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      className="h-100"
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={handleNumInput}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              {errorOccurred && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer>
              <Form.Group className="my-2">
                <Row>
                  <Col>
                    <Button variant="secondary" onClick={closeModal}>
                      Close
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="primary" type="submit">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Modal.Footer>
          </Form>
        </>
      ) : (
        <LoadingMessage message="Adding the transaction" />
      )}
    </Modal>
  );
};

export default AddTransactionModal;
