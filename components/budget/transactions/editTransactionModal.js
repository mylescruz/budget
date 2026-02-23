import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useContext, useState } from "react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import SelectCategoryOption from "./selectCategoryOption";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorMessage from "@/components/layout/errorMessage";

const EditTransactionModal = ({
  chosenTransaction,
  setChosenTransaction,
  dateInfo,
  modal,
  setModal,
}) => {
  const { categories, getCategories } = useContext(CategoriesContext);
  const { putTransaction } = useContext(TransactionsContext);
  const [status, setStatus] = useState("editing");

  const closeEditModal = () => {
    setModal("transactionDetails");
  };

  const handleInput = (e) => {
    setChosenTransaction({
      ...chosenTransaction,
      [e.target.id]: e.target.value,
    });
  };

  const editTheTransaction = async (e) => {
    setStatus("updating");

    try {
      e.preventDefault();

      const formattedAmount = Number(chosenTransaction.amount);

      if (isNaN(formattedAmount)) {
        throw new Error("Invalid amount entered");
      }

      await putTransaction({
        ...chosenTransaction,
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
              <Form.Group className="mb-2">
                <Form.Label>Date of transaction</Form.Label>
                <Form.Control
                  id="date"
                  className="h-100"
                  type="date"
                  min={dateInfo.startOfMonth}
                  max={dateInfo.endOfMonth}
                  value={chosenTransaction.date}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Stores shopped at</Form.Label>
                <Form.Control
                  id="store"
                  className="h-100"
                  type="text"
                  placeholder="Store"
                  value={chosenTransaction.store}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Items purchased</Form.Label>
                <Form.Control
                  id="items"
                  className="h-100"
                  type="text"
                  placeholder="What was purchased?"
                  value={chosenTransaction.items}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group className="my-2">
                <Form.Label>Associated category</Form.Label>
                <Form.Select
                  id="category"
                  className="h-100"
                  value={chosenTransaction.category}
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
              <Form.Group className="my-2">
                <Form.Label>Cost of transaction</Form.Label>
                <Form.Control
                  id="amount"
                  className="h-100"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={chosenTransaction.amount}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
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
