import centsToDollars from "@/helpers/centsToDollars";
import dollarsToCents from "@/helpers/dollarsToCents";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import { Button, Col, Form } from "react-bootstrap";

const categoryFrequencies = ["Monthly", "Semi-Annually", "Annually"];

const EditSubcategoryPage = ({
  editedCategory,
  setEditedCategory,
  editedSubcategory,
  setEditedSubcategory,
  setPage,
  nameChange,
  setNameChange,
}) => {
  const handleInput = (e) => {
    const id = e.target.id;

    if (id === "name") {
      setNameChange({ ...nameChange, subcategory: true });
      setEditedSubcategory({
        ...editedSubcategory,
        [id]: e.target.value,
        nameChanged: true,
      });
    } else {
      setEditedSubcategory({
        ...editedSubcategory,
        [id]: e.target.value,
      });
    }
  };

  const saveSubcategory = () => {
    let subcategoriesTotal = 0;

    const updatedSubcategories = editedCategory.subcategories.map(
      (subcategory) => {
        if (subcategory.id === editedSubcategory.id) {
          subcategoriesTotal += dollarsToCents(editedSubcategory.actual);

          return { ...editedSubcategory, actual: editedSubcategory.actual };
        } else {
          subcategoriesTotal += dollarsToCents(subcategory.actual);
          return subcategory;
        }
      },
    );

    setEditedCategory({
      ...editedCategory,
      budget: editedCategory.fixed
        ? centsToDollars(subcategoriesTotal)
        : editedCategory.budget,
      actual: editedCategory.fixed
        ? centsToDollars(subcategoriesTotal)
        : editedCategory.actual,
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
        editedSubcategory.actual,
      );
      categoryActual -= dollarsToCents(editedSubcategory.actual);
    }

    const updatedCategory = {
      ...editedCategory,
      budget: categoryBudget,
      actual: categoryActual,
      subcategories: editedCategory.subcategories.filter(
        (sub) => sub.id !== editedSubcategory.id,
      ),
    };

    if (updatedCategory.subcategories.length === 0) {
      updatedCategory.budget = "";
      updatedCategory.frequency = "Monthly";
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
            <Form.Group controlId="actual" className="my-2">
              <Form.Label>Actual Amount</Form.Label>
              <Form.Control
                type="number"
                placeholder="Amount"
                value={editedSubcategory.actual}
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
                {categoryFrequencies.map((frequency) => (
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
              (editedSubcategory.actual === "" ||
                editedSubcategory.actual <= 0 ||
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
