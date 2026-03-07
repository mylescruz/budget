import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { Form } from "react-bootstrap";
import SelectCategoryOption from "../selectCategoryOption";

const EditExpenseForm = ({ dateInfo, transaction, handleInput }) => {
  const { categories } = useContext(CategoriesContext);

  return (
    <>
      <Form.Group controlId="date" className="my-3">
        <Form.Label>Date of transaction</Form.Label>
        <Form.Control
          className="h-100"
          type="date"
          min={dateInfo.startOfMonth}
          max={dateInfo.endOfMonth}
          value={transaction.date}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group controlId="store" className="my-3">
        <Form.Label>Store shopped at</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.store}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group controlId="items" className="my-3">
        <Form.Label>Items purchased</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.items}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group controlId="category" className="my-3">
        <Form.Label>Associated category</Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.category}
          onChange={handleInput}
          required
        >
          {categories.map(
            (category) =>
              !category.fixed && (
                <SelectCategoryOption key={category._id} category={category} />
              ),
          )}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="amount" className="my-3">
        <Form.Label>Cost of transaction</Form.Label>
        <Form.Control
          className="h-100"
          type="number"
          step="0.01"
          value={transaction.amount}
          onChange={handleInput}
          required
        />
      </Form.Group>
    </>
  );
};

export default EditExpenseForm;
