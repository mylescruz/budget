import { useContext } from "react";
import { Form } from "react-bootstrap";
import SelectCategoryOption from "../selectCategoryOption";
import handleObjectInput from "@/helpers/handleObjectInput";
import { BudgetContext } from "@/contexts/BudgetContext";

const EditExpenseForm = ({ dateInfo, transaction, setTransaction }) => {
  const { categories } = useContext(BudgetContext);

  const variableCategories = categories.filter((category) => !category.fixed);

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
          onChange={(e) => handleObjectInput({ e, setObject: setTransaction })}
          required
        />
      </Form.Group>
      <Form.Group controlId="store" className="my-3">
        <Form.Label>Store shopped at</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.store}
          onChange={(e) => handleObjectInput({ e, setObject: setTransaction })}
          required
        />
      </Form.Group>
      <Form.Group controlId="items" className="my-3">
        <Form.Label>Items purchased</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          value={transaction.items}
          onChange={(e) => handleObjectInput({ e, setObject: setTransaction })}
          required
        />
      </Form.Group>
      <Form.Group controlId="category" className="my-3">
        <Form.Label>Associated category</Form.Label>
        <Form.Select
          className="h-100"
          value={transaction.category}
          onChange={(e) => handleObjectInput({ e, setObject: setTransaction })}
          required
        >
          {variableCategories.map((category) => (
            <SelectCategoryOption key={category._id} category={category} />
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group controlId="amount" className="my-3">
        <Form.Label>Cost of transaction</Form.Label>
        <Form.Control
          className="h-100"
          type="number"
          step="0.01"
          value={transaction.amount}
          onChange={(e) => handleObjectInput({ e, setObject: setTransaction })}
          required
        />
      </Form.Group>
    </>
  );
};

export default EditExpenseForm;
