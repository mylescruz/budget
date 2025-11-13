import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const AddSubcategoryForm = ({
  updatedCategory,
  setUpdatedCategory,
  setAddSubcategoryClicked,
}) => {
  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: "",
  };

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

  const handleInput = (e) => {
    setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input === "") {
      setNewSubcategory({ ...newSubcategory, actual: input });
    } else {
      setNewSubcategory({ ...newSubcategory, actual: parseFloat(input) });
    }
  };

  const cancelAddSubcategory = () => {
    setAddSubcategoryClicked(false);
  };

  const addToCategory = (e) => {
    e.preventDefault();

    // Validation for the subcategory name
    if (newSubcategory.name === "") {
      return;
    }

    // Validation for the subcategory actual value
    if (updatedCategory.fixed && newSubcategory.actual === "") {
      return;
    }

    // Set the actual value to cents or 0 if it is a new not fixed subcategory
    if (!updatedCategory.fixed) {
      newSubcategory.actual = 0;
    } else {
      newSubcategory.actual = newSubcategory.actual * 100;
    }

    if (updatedCategory.hasSubcategory) {
      // If the category already has subcategories

      // If the category is fixed, add the new subcategory total to the budget value
      const budgetValue = updatedCategory.fixed
        ? (updatedCategory.budget * 100 + newSubcategory.actual) / 100
        : updatedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = updatedCategory.fixed
        ? (updatedCategory.budget * 100 + newSubcategory.actual) / 100
        : updatedCategory.actual;

      // Update the total budget and add subcategory
      setUpdatedCategory({
        ...updatedCategory,
        budget: budgetValue,
        actual: actualValue,
        subcategories: [...updatedCategory.subcategories, newSubcategory],
      });
    } else {
      // If the category is fixed, the budget is now dependent on the new subcategory total
      const budgetValue = updatedCategory.fixed
        ? newSubcategory.actual / 100
        : updatedCategory.budget;

      // If the category is fixed, the actual is set to the subcategory total
      const actualValue = updatedCategory.fixed
        ? newSubcategory.actual / 100
        : updatedCategory.actual;

      setUpdatedCategory({
        ...updatedCategory,
        budget: budgetValue,
        actual: actualValue,
        hasSubcategory: true,
        subcategories: [newSubcategory],
      });
    }

    setAddSubcategoryClicked(false);
  };

  return (
    <Row className="d-flex flex-start align-items-center">
      <Col className={`${updatedCategory.fixed && "col-4 col-md-6"}`}>
        <Form.Control
          id="name"
          className="add-subcategory"
          type="text"
          placeholder="Name"
          value={newSubcategory.name}
          onChange={handleInput}
        />
      </Col>
      <Col className={`${updatedCategory.fixed ? "col-4 col-lg-4" : "d-none"}`}>
        <Form.Control
          id="actual"
          className="add-subcategory"
          type="number"
          placeholder="Amount"
          value={newSubcategory.actual}
          onChange={handleNumInput}
        />
      </Col>
      <Col className="col-1 cancel-sub">
        <i
          className={`bi bi-x-circle cancel`}
          onClick={cancelAddSubcategory}
        ></i>
      </Col>
      <Col className="col-1 check-sub">
        <i className={`bi bi-check-circle check`} onClick={addToCategory}></i>
      </Col>
    </Row>
  );
};

export default AddSubcategoryForm;
