import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import handleObjectInput from "@/helpers/handleObjectInput";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import {
  FIXED_FREQUENCIES,
  FIXED_FREQUENCIES_LIST,
} from "@/lib/constants/categories";
import { Button, Col, Form } from "react-bootstrap";

const EditSubcategoryPage = ({
  editedCategory,
  setEditedCategory,
  editedSubcategory,
  setEditedSubcategory,
  setFieldChanges,
  setPage,
  validateCategoryName,
}) => {
  const handleInput = (e) => {
    const id = e.target.id;

    if (id === "name") {
      setFieldChanges((prev) => ({ ...prev, name: true }));
    } else {
      if (id === "budget" && editedCategory.fixed) {
        setFieldChanges((prev) => ({
          ...prev,
          budget: true,
        }));
      }
    }

    handleObjectInput({ e, setObject: setEditedSubcategory });
  };

  const saveSubcategory = () => {
    // Validate whether the inputted subcategory name has been taken or not
    const validName = validateCategoryName(editedSubcategory.name);

    if (!validName) {
      return;
    }

    let subcategoriesTotal = 0;

    const updatedSubcategories = editedCategory.subcategories.map(
      (subcategory) => {
        if (subcategory._id === editedSubcategory._id) {
          subcategoriesTotal += dollarsToCents(editedSubcategory.budget);

          return { ...editedSubcategory, budget: editedSubcategory.budget };
        } else {
          subcategoriesTotal += dollarsToCents(subcategory.budget);
          return subcategory;
        }
      },
    );

    setEditedCategory({
      ...editedCategory,
      budget: editedCategory.fixed
        ? centsToDollars(subcategoriesTotal)
        : editedCategory.budget,
      budget: editedCategory.fixed
        ? centsToDollars(subcategoriesTotal)
        : editedCategory.budget,
      subcategories: updatedSubcategories,
    });

    setPage("details");
  };

  // Fix and distinguish between fixed and non-fixed categories
  const deleteSubcategory = () => {
    let categoryBudget = editedCategory.budget;
    let categoryActual = editedCategory.actual;

    if (editedCategory.fixed) {
      categoryBudget = subtractDecimalValues(
        categoryBudget,
        editedSubcategory.budget,
      );
      categoryActual -= dollarsToCents(editedSubcategory.budget);
    }

    const updatedSubcategories = editedCategory.subcategories.map(
      (subcategory) => {
        if (subcategory._id === editedSubcategory._id) {
          return {
            ...subcategory,
            deleted: true,
          };
        } else {
          return subcategory;
        }
      },
    );

    const updatedCategory = {
      ...editedCategory,
      budget: categoryBudget,
      actual: categoryActual,
      subcategories: updatedSubcategories,
    };

    if (updatedCategory.subcategories.length === 0) {
      updatedCategory.budget = "";
      updatedCategory.frequency = FIXED_FREQUENCIES.MONTHLY;
      updatedCategory.dueDate = "";
    }

    setEditedCategory(updatedCategory);

    setPage("details");
  };

  return (
    <div>
      <Col className="col-12 col-md-8">
        <Form.Group controlId="name" className="mb-2">
          <Form.Label>Subcategory Name</Form.Label>
          <Form.Control
            className="h-100"
            type="text"
            placeholder="Name"
            value={editedSubcategory.name}
            onChange={handleInput}
            required
          />
        </Form.Group>
      </Col>
      {editedCategory.fixed && (
        <div>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="budget" className="my-2">
              <Form.Label>Amount Charged</Form.Label>
              <Form.Control
                type="number"
                placeholder="Amount"
                value={editedSubcategory.budget}
                onChange={handleInput}
              />
            </Form.Group>
          </Col>
          <Col className="col-12 col-md-8">
            <Form.Group controlId="frequency" className="mb-2">
              <Form.Label>How often does this occur?</Form.Label>
              <Form.Select
                className="h-100"
                value={editedSubcategory.frequency}
                onChange={handleInput}
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
                value={editedSubcategory.dueDate}
                onChange={handleInput}
              />
            </Form.Group>
          </Col>
        </div>
      )}
      <div className="w-100 d-flex justify-content-between mt-4">
        <Button
          variant="danger"
          disabled={!editedCategory.fixed && editedSubcategory.actual !== 0}
          onClick={deleteSubcategory}
        >
          Delete
        </Button>
        <Button
          variant="primary"
          disabled={
            editedSubcategory.name === "" ||
            (editedCategory.fixed &&
              (editedSubcategory.budget === "" ||
                editedSubcategory.budget <= 0 ||
                editedSubcategory.dueDate === "" ||
                editedSubcategory.dueDate > 31 ||
                editedSubcategory.dueDate < 1 ||
                !editedSubcategory.dueDate))
          }
          onClick={saveSubcategory}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditSubcategoryPage;
