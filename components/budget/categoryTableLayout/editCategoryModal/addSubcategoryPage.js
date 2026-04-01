import addDecimalValues from "@/helpers/addDecimalValues";
import handleObjectInput from "@/helpers/handleObjectInput";
import {
  FIXED_FREQUENCIES,
  FIXED_FREQUENCIES_LIST,
} from "@/lib/constants/categories";
import { useState } from "react";
import { Button, Col, Form } from "react-bootstrap";

const AddSubcategoryPage = ({
  editedCategory,
  setEditedCategory,
  backToDetails,
  setPage,
  validateCategoryName,
}) => {
  const emptySubcategory = {
    name: "",
    actual: "",
    frequency: FIXED_FREQUENCIES.MONTHLY,
    dueDate: "",
    added: true,
  };

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

  const addSubcategory = () => {
    // Validate whether the inputted subcategory name has been taken or not
    const validName = validateCategoryName(newSubcategory.name);

    if (!validName) {
      return;
    }

    // Set the budget value to cents or 0 if it is a new not fixed subcategory
    if (!editedCategory.fixed) {
      newSubcategory.budget = 0;
    } else {
      newSubcategory.budget = Number(newSubcategory.budget);
    }

    if (editedCategory.subcategories.length > 0) {
      // If the category already has subcategories

      // If the category is fixed, add the new subcategory total to the budget value
      const budgetValue = editedCategory.fixed
        ? addDecimalValues(editedCategory.budget, newSubcategory.budget)
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? addDecimalValues(editedCategory.budget, newSubcategory.budget)
        : editedCategory.budget;

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
        ? newSubcategory.budget
        : editedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = editedCategory.fixed
        ? newSubcategory.budget
        : editedCategory.actual;

      const updatedCategory = {
        ...editedCategory,
        budget: budgetValue,
        actual: actualValue,
        subcategories: [newSubcategory],
      };

      if (editedCategory.fixed) {
        updatedCategory.frequency = null;
        updatedCategory.dueDate = null;
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
          onChange={(e) =>
            handleObjectInput({ e, setObject: setNewSubcategory })
          }
          required
        />
      </Form.Group>
      {editedCategory.fixed && (
        <div>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="budget" className="my-2">
              <Form.Label>How much are you charged?</Form.Label>
              <Form.Control
                className="add-subcategory"
                type="number"
                placeholder="Amount"
                value={newSubcategory.budget}
                onChange={(e) =>
                  handleObjectInput({ e, setObject: setNewSubcategory })
                }
              />
            </Form.Group>
          </Col>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="frequency" className="mb-2">
              <Form.Label>How often does this occur?</Form.Label>
              <Form.Select
                className="h-100"
                value={newSubcategory.frequency}
                onChange={(e) =>
                  handleObjectInput({ e, setObject: setNewSubcategory })
                }
                required
              >
                {FIXED_FREQUENCIES_LIST.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="dueDate" className="my-2">
              <Form.Label>What day of the month are you charged?</Form.Label>
              <Form.Control
                className="h-100"
                type="number"
                min={1}
                max={31}
                value={newSubcategory.dueDate}
                onChange={(e) =>
                  handleObjectInput({ e, setObject: setNewSubcategory })
                }
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
              (newSubcategory.budget === "" ||
                newSubcategory.budget <= 0 ||
                newSubcategory.dueDate === "" ||
                newSubcategory.dueDate > 31 ||
                newSubcategory.dueDate < 1))
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
