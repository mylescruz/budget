import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const AddSubcategoryPage = ({
  editedCategory,
  setEditedCategory,
  backToDetails,
  setPage,
}) => {
  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: "",
    dayOfMonth: "",
  };

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

  const handleInput = (e) => {
    setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value });
  };

  const addSubcategory = () => {
    // Set the actual value to cents or 0 if it is a new not fixed subcategory
    if (!editedCategory.fixed) {
      newSubcategory.actual = 0;
    } else {
      newSubcategory.actual = newSubcategory.actual * 100;
    }

    if (editedCategory.hasSubcategory) {
      // If the category already has subcategories

      // If the category is fixed, add the new subcategory total to the budget value
      const budgetValue = editedCategory.fixed
        ? (editedCategory.budget * 100 + newSubcategory.actual) / 100
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? (editedCategory.budget * 100 + newSubcategory.actual) / 100
        : editedCategory.actual;

      // Update the total budget and add subcategory
      setEditedCategory({
        ...editedCategory,
        budget: budgetValue,
        actual: actualValue,
        subcategories: [...editedCategory.subcategories, newSubcategory],
      });
    } else {
      // If the category is fixed, the budget is now dependent on the new subcategory total
      const budgetValue = editedCategory.fixed
        ? newSubcategory.actual / 100
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? newSubcategory.actual / 100
        : editedCategory.actual;

      setEditedCategory({
        ...editedCategory,
        budget: budgetValue,
        actual: actualValue,
        hasSubcategory: true,
        subcategories: [newSubcategory],
      });
    }

    setPage("details");
  };

  return (
    <div>
      <Form.Group controlId="name" className="mb-2">
        <Form.Label>Subcategory Name</Form.Label>
        <Form.Control
          className="h-100"
          type="text"
          placeholder="Name"
          value={newSubcategory.name}
          onChange={handleInput}
          required
        />
      </Form.Group>
      {editedCategory.fixed && (
        <div>
          <Form.Group controlId="actual" className="my-2">
            <Form.Label>Actual Amount</Form.Label>
            <Form.Control
              className="add-subcategory"
              type="number"
              placeholder="Amount"
              value={newSubcategory.actual}
              onChange={handleInput}
            />
          </Form.Group>
          <Form.Group controlId="dayOfMonth" className="my-2">
            <Form.Label>What day of the month are you charged?</Form.Label>
            <Form.Control
              className="h-100 w-25"
              type="number"
              min={1}
              max={31}
              value={newSubcategory.dayOfMonth}
              onChange={handleInput}
            />
          </Form.Group>
        </div>
      )}
      <div className="w-100 d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={backToDetails}>
          Back
        </Button>
        <Button
          variant="primary"
          disabled={
            newSubcategory.name === "" ||
            (editedCategory.fixed &&
              (newSubcategory.actual === "" ||
                newSubcategory.dayOfMonth === "" ||
                newSubcategory.dayOfMonth > 31 ||
                newSubcategory.dayOfMonth < 1))
          }
          onClick={addSubcategory}
        >
          Add
        </Button>
      </div>
    </div>
  );
};

export default AddSubcategoryPage;
