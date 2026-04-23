import { useContext } from "react";
import { Form } from "react-bootstrap";
import SelectCategoryOption from "../selectCategoryOption";
import { BudgetContext } from "@/contexts/BudgetContext";

const AddExpenseForm = ({ dateInfo, transaction, handleInput, index }) => {
  const { categories } = useContext(BudgetContext);

  return (
    <>
      <Form.Group controlId="date" className="my-2">
        <Form.Label>
          Date of the transaction <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="date"
          min={dateInfo.startOfMonth}
          max={dateInfo.endOfMonth}
          value={transaction.date}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
      <Form.Group controlId="store" className="my-2">
        <Form.Label>
          Where did you shop? <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.store}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
      <Form.Group controlId="items" className="my-2">
        <Form.Label>
          What did you purchase? <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.items}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
      <Form.Group controlId="category" className="my-2">
        <Form.Label>
          Which category does this transaction apply to?{" "}
          <span className="text-danger">*</span>
        </Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.category}
          onChange={(e) => handleInput(e, index)}
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
      <Form.Group controlId="amount" className="my-2">
        <Form.Label>
          How much did it cost? <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          className="h-100"
          type="number"
          step="0.01"
          value={transaction.amount}
          onChange={(e) => handleInput(e, index)}
          required
        />
      </Form.Group>
    </>
  );
};

export default AddExpenseForm;
