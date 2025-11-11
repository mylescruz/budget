import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import SelectCategoryOption from "./selectCategoryOption";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";

const EditTransactionModal = ({
  transaction,
  dateInfo,
  showEdit,
  setShowEdit,
  setShowDetails,
}) => {
  const { categories, getCategories } = useContext(CategoriesContext);
  const { putTransaction } = useContext(TransactionsContext);
  const [edittedTransaction, setEdittedTransaction] = useState({
    ...transaction,
    amount: transaction.amount / 100,
  });
  const [updatingTransaction, setUpdatingTransaction] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const closeEdit = () => {
    setShowEdit(false);
    setShowDetails(true);
  };

  const editTheTransaction = async (e) => {
    setUpdatingTransaction(true);

    try {
      e.preventDefault();

      // If the Edit Transaction Modal is showing, update the transaction and then close the modal
      if (showEdit) {
        setEdittedTransaction(edittedTransaction);
        await putTransaction({
          ...edittedTransaction,
          oldCategory: transaction.category,
          oldAmount: transaction.amount,
        });

        // Fetch the categories to update the state for the categories table
        await getCategories(dateInfo.month, dateInfo.year);

        setShowEdit(false);
      } else {
        setShowEdit(true);
      }

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setUpdatingTransaction(false);
    }
  };

  const handleInput = (e) => {
    setEdittedTransaction({
      ...edittedTransaction,
      [e.target.id]: e.target.value,
    });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input === "")
      setEdittedTransaction({ ...edittedTransaction, amount: input });
    else
      setEdittedTransaction({
        ...edittedTransaction,
        amount: parseFloat(input),
      });
  };

  return (
    <Modal show={showEdit} onHide={closeEdit} centered>
      {!updatingTransaction ? (
        <>
          <Modal.Header>
            <Modal.Title>Edit Transaction</Modal.Title>
          </Modal.Header>
          <Form onSubmit={editTheTransaction}>
            <Modal.Body>
              <Form.Group className="my-2">
                <Form.Control
                  id="date"
                  className="h-100"
                  type="date"
                  min={dateInfo.startOfMonth}
                  max={dateInfo.endOfMonth}
                  value={edittedTransaction.date}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Control
                  id="store"
                  className="h-100"
                  type="text"
                  placeholder="Store"
                  value={edittedTransaction.store}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Control
                  id="items"
                  className="h-100"
                  type="text"
                  placeholder="What was purchased?"
                  value={edittedTransaction.items}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Select
                  id="category"
                  className="h-100"
                  value={edittedTransaction.category}
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
              <Form.Group className="my-2">
                <Form.Control
                  id="amount"
                  className="h-100"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={edittedTransaction.amount}
                  onChange={handleNumInput}
                  required
                />
              </Form.Group>
              {errorOccurred && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer>
              <Form.Group className="my-2">
                <Row>
                  <Col>
                    <Button variant="secondary" onClick={closeEdit}>
                      Cancel
                    </Button>
                  </Col>
                  <Col className="text-nowrap">
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Modal.Footer>
          </Form>
        </>
      ) : (
        <LoadingMessage message="Updating this transaction" />
      )}
    </Modal>
  );
};

export default EditTransactionModal;
