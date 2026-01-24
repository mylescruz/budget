import addDecimalValues from "@/helpers/addDecimalValues";
import { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const categoryFrequencies = ["Monthly", "Semi-Annually", "Annually"];

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
    frequency: "Monthly",
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
      newSubcategory.actual = Number(newSubcategory.actual);
    }

    if (editedCategory.subcategories.length > 0) {
      // If the category already has subcategories

      // If the category is fixed, add the new subcategory total to the budget value
      const budgetValue = editedCategory.fixed
        ? addDecimalValues(editedCategory.budget, newSubcategory.actual)
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? addDecimalValues(editedCategory.budget, newSubcategory.actual)
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
        ? newSubcategory.actual
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? newSubcategory.actual
        : editedCategory.actual;

      const updatedCategory = {
        ...editedCategory,
        budget: budgetValue,
        actual: actualValue,
        subcategories: [newSubcategory],
      };

      if (editedCategory.fixed) {
        updatedCategory.frequency = null;
        updatedCategory.dayOfMonth = null;
      }

      setEditedCategory(updatedCategory);
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
          <Col className="col-12 col-md-8">
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
          </Col>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="frequency" className="mb-2">
              <Form.Label>How often does this occur?</Form.Label>
              <Form.Select
                className="h-100"
                value={newSubcategory.frequency}
                onChange={handleInput}
                required
              >
                {categoryFrequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="dayOfMonth" className="my-2">
              <Form.Label>What day of the month are you charged?</Form.Label>
              <Form.Control
                className="h-100"
                type="number"
                min={1}
                max={31}
                value={newSubcategory.dayOfMonth}
                onChange={handleInput}
              />
            </Form.Group>
          </Col>
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
                newSubcategory.actual <= 0 ||
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
