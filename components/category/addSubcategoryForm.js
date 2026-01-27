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

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

  const handleInput = (e) => {
    setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value });
  };

  const addNewSubcategory = (e) => {
    e.preventDefault();

    setNewCategory({
      ...newCategory,
      subcategories: [...newCategory.subcategories, newSubcategory],
    });

    setNewSubcategory(emptySubcategory);
  };

  return (
    <div>
      <Form onSubmit={addNewSubcategory}>
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
                required
              />
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
                    min={0.01}
                    value={newSubcategory.actual}
                    onChange={handleInput}
                    required
                  />
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
                    min={1}
                    max={31}
                    value={newSubcategory.dueDate}
                    onChange={handleInput}
                    required
                  />
                </Form.Group>
              </Col>
            </div>
          )}
          <Col className="col-12">
            <Button
              variant="primary"
              type="submit"
              className="btn-sm w-100 my-2"
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form>

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
