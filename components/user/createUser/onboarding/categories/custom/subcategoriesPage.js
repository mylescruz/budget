import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const SubcategoriesPage = ({ newCategory, setNewCategory, dateInfo }) => {
  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: "",
    date: "",
  };

  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);

  const handleSubcategoryInput = (e) => {
    setNewSubcategory({ ...newSubcategory, [e.target.id]: e.target.value });
  };

  const addNewSubcategory = () => {
    setNewCategory({
      ...newCategory,
      subcategories: [...newCategory.subcategories, newSubcategory],
    });

    setNewSubcategory(emptySubcategory);
  };

  const deleteSubcategory = (subcategory) => {
    setNewCategory({
      ...newCategory,
      subcategories: newCategory.subcategories.filter(
        (subCat) => subCat.id !== subcategory.id
      ),
    });
  };

  return (
    <div className="mb-2">
      <h5 className="m-0">Enter {newCategory.name}'s subcategories</h5>
      <Form.Group className="my-2">
        <Row className="d-flex flex-column flex-md-row align-items-center">
          <Col className="col-12">
            <Form.Group controlId="name" className="my-2">
              <Form.Label>Subcategory Name</Form.Label>
              <Form.Control
                className="h-100"
                type="text"
                value={newSubcategory.name}
                onChange={handleSubcategoryInput}
              />
            </Form.Group>
          </Col>
          {newCategory.fixed && (
            <Col className="col-12">
              <Form.Group controlId="actual" className="my-2">
                <Form.Label>How much does it cost?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="number"
                  step={0.01}
                  value={newSubcategory.actual}
                  onChange={handleSubcategoryInput}
                />
              </Form.Group>
            </Col>
          )}
          {newCategory.fixed && (
            <Col className="col-12">
              <Form.Group controlId="date" className="my-2">
                <Form.Label>What day does it get charged?</Form.Label>
                <Form.Control
                  className="h-100"
                  type="date"
                  min={dateInfo.startOfMonth}
                  max={`${dateInfo.year}-${dateInfo.month}-28`}
                  value={newSubcategory.date}
                  onChange={handleSubcategoryInput}
                />
              </Form.Group>
            </Col>
          )}
          <Col className="col-12">
            <Button
              type="primary"
              className="btn-sm w-100 my-2"
              onClick={addNewSubcategory}
              disabled={
                newSubcategory.name === "" ||
                (newCategory.fixed && newSubcategory.actual === "")
              }
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form.Group>
      {newCategory.subcategories.length > 0 && (
        <div>
          <Row className="fw-bold">
            <Col className={`${newCategory.fixed ? "col-4" : "col-9"}`}>
              Name
            </Col>
            {newCategory.fixed && <Col className="col-3">Amount</Col>}
            {newCategory.fixed && <Col className="col-3">Date</Col>}
            <Col className={`${newCategory.fixed ? "col-2" : "col-3"}`}>
              Delete
            </Col>
          </Row>
          <div>
            {newCategory.subcategories.map((subcategory) => (
              <Row key={subcategory.id}>
                <Col className={`${newCategory.fixed ? "col-4" : "col-9"}`}>
                  {subcategory.name}
                </Col>
                {newCategory.fixed && (
                  <Col className="col-3">${subcategory.actual}</Col>
                )}
                {newCategory.fixed && (
                  <Col className="col-3">{dateFormatter(subcategory.date)}</Col>
                )}
                <Col className={`${newCategory.fixed ? "col-2" : "col-3"}`}>
                  <i
                    className="bi bi-trash delete"
                    onClick={() => {
                      deleteSubcategory(subcategory);
                    }}
                  />
                </Col>
              </Row>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoriesPage;
