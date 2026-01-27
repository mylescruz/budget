import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import AddedSubcategories from "./addedSubcategories";

const groupFormStyle = "my-2";
const inputFormStyle = "h-100";

const categoryFrequencies = ["Monthly", "Semi-Annually", "Annually"];

const AddSubcategoryForm = ({ newCategory, setNewCategory }) => {
  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: "",
    frequency: "Monthly",
    dueDate: "",
  };

  const subcategoryValidation = {
    name: { valid: true, error: "" },
    actual: { valid: true, error: "" },
    dueDate: { valid: true, error: "" },
  };

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
  const [validation, setValidation] = useState(subcategoryValidation);

  const handleInput = (e) => {
    setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value });
  };

  const addNewSubcategory = () => {
    const errors = { ...subcategoryValidation };

    let valid = true;

    if (newSubcategory.name === "") {
      errors.name = {
        valid: false,
        error: "Please enter a subcategory name",
      };

      valid = false;
    }

    if (newCategory.fixed) {
      if (newSubcategory.actual === "") {
        errors.actual = {
          valid: false,
          error: "Please enter an amount",
        };

        valid = false;
      } else if (newSubcategory.actual <= 0) {
        errors.actual = {
          valid: false,
          error: "The amount must be greater than 0",
        };

        valid = false;
      }

      if (newSubcategory.dueDate === "") {
        errors.dueDate = {
          valid: false,
          error: "Please enter a due date",
        };

        valid = false;
      } else if (newSubcategory.dueDate < 1 || newSubcategory.dueDate > 31) {
        errors.dueDate = {
          valid: false,
          error: "The date must be within a calendar month: 1-31",
        };

        valid = false;
      }
    }

    if (!valid) {
      setValidation(errors);

      return;
    }

    setValidation(subcategoryValidation);

    setNewCategory({
      ...newCategory,
      subcategories: [...newCategory.subcategories, newSubcategory],
    });

    setNewSubcategory(emptySubcategory);
  };

  return (
    <div>
      <div>
        <h5 className="text-center mb-2 mx-0">
          Enter {newCategory.name}'s subcategories
        </h5>
        <Row className="d-flex flex-column">
          <Col className="col-12">
            <Form.Group controlId="name" className={groupFormStyle}>
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control
                className={inputFormStyle}
                type="text"
                value={newSubcategory.name}
                onChange={handleInput}
                isInvalid={!validation.name.valid}
              />
              <Form.Control.Feedback type="invalid">
                {validation.name.error}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          {newCategory.fixed && (
            <div>
              <Col className="col-12">
                <Form.Group controlId="frequency" className={groupFormStyle}>
                  <Form.Label>How often does this occur?</Form.Label>
                  <Form.Select
                    className={inputFormStyle}
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
              <Col className="col-12">
                <Form.Group controlId="actual" className={groupFormStyle}>
                  <Form.Label>How much are you charged?</Form.Label>
                  <Form.Control
                    className={inputFormStyle}
                    type="number"
                    step={0.01}
                    value={newSubcategory.actual}
                    onChange={handleInput}
                    isInvalid={!validation.actual.valid}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validation.actual.error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col className="col-12">
                <Form.Group controlId="dueDate" className={groupFormStyle}>
                  <Form.Label>
                    What day of the month are you charged?
                  </Form.Label>
                  <Form.Control
                    className={inputFormStyle}
                    type="number"
                    step={1}
                    value={newSubcategory.dueDate}
                    onChange={handleInput}
                    isInvalid={!validation.dueDate.valid}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validation.dueDate.error}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </div>
          )}
          <Col className="col-12">
            <Button
              variant="primary"
              className="btn-sm w-100 my-2"
              onClick={addNewSubcategory}
            >
              Add
            </Button>
          </Col>
        </Row>
      </div>

      {newCategory.subcategories.length > 0 && (
        <AddedSubcategories
          newCategory={newCategory}
          setNewCategory={setNewCategory}
        />
      )}
    </div>
  );
};

export default AddSubcategoryForm;
