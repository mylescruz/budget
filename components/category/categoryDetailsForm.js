import { Button, Col, Form, Row } from "react-bootstrap";

const formGroupStyle = "my-2";
const inputStyle = "h-100";

const categoryFrequencies = ["Monthly", "Semi-Annually", "Annually"];

const CategoryDetailsForm = ({ newCategory, setNewCategory }) => {
  const handleInput = (e) => {
    setNewCategory({ ...newCategory, [e.target.id]: e.target.value });
  };

  const markFixed = () => {
    setNewCategory((prevCategory) => {
      return {
        ...prevCategory,
        fixed: true,
        budget: prevCategory.hasSubcategory ? "" : prevCategory.budget,
        dueDate: prevCategory.hasSubcategory ? "" : prevCategory.dueDate,
        subcategories: !prevCategory.fixed ? [] : prevCategory.subcategories,
      };
    });
  };

  const markVariable = () => {
    setNewCategory((prevCategory) => {
      return {
        ...prevCategory,
        fixed: false,
        budget: prevCategory.hasSubcategory ? "" : prevCategory.budget,
        dueDate: prevCategory.hasSubcategory ? "" : prevCategory.dueDate,
        subcategories: prevCategory.subcategories.map((subcategory) => {
          return { ...subcategory, actual: "", dueDate: "" };
        }),
      };
    });
  };

  const includeSubcategories = () => {
    setNewCategory((prevCategory) => {
      return {
        ...prevCategory,
        hasSubcategory: true,
        budget: prevCategory.fixed ? "" : prevCategory.budget,
        dueDate: prevCategory.fixed ? "" : prevCategory.dueDate,
      };
    });
  };

  const removeSubcategories = () => {
    setNewCategory((prevCategory) => {
      return {
        ...prevCategory,
        hasSubcategory: false,
        budget: prevCategory.fixed ? "" : prevCategory.budget,
        dueDate: prevCategory.fixed ? "" : prevCategory.dueDate,
        subcategories: [],
      };
    });
  };

  return (
    <div>
      <Row className="d-flex">
        <Col className="col-12 col-md-6 col-lg-8">
          <Form.Group controlId="name" className={formGroupStyle}>
            <Form.Label>Name this category</Form.Label>
            <Form.Control
              className={inputStyle}
              type="text"
              placeholder="Name"
              value={newCategory.name}
              onChange={handleInput}
            />
          </Form.Group>
        </Col>
        <Col className="col-12 col-md-6 col-lg-4">
          <Form.Group controlId="color" className={formGroupStyle}>
            <Form.Label>Choose a color</Form.Label>
            <Form.Control
              type="color"
              className="form-control-color"
              value={newCategory.color}
              onChange={handleInput}
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group controlId="fixed" className={formGroupStyle}>
        <Form.Label>Is it the same amount every month?</Form.Label>
        <div>
          <Button
            className={`${
              newCategory.fixed
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={markFixed}
          >
            Yes
          </Button>
          <Button
            className={`mx-2 ${
              !newCategory.fixed
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={markVariable}
          >
            No
          </Button>
        </div>
      </Form.Group>
      <Form.Group controlId="hasSubcategory" className={formGroupStyle}>
        <Form.Label>Does it have subcategories?</Form.Label>
        <div>
          <Button
            className={`${
              newCategory.hasSubcategory
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={includeSubcategories}
          >
            Yes
          </Button>
          <Button
            className={`mx-2 ${
              !newCategory.hasSubcategory
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={removeSubcategories}
          >
            No
          </Button>
        </div>
      </Form.Group>
      {(!newCategory.hasSubcategory || !newCategory.fixed) && (
        <Col className="col-12 col-md-8">
          <Form.Group controlId="budget" className={formGroupStyle}>
            <Form.Label>
              {newCategory.fixed
                ? "How much are you charged?"
                : "What is this category's budget?"}
            </Form.Label>
            <Form.Control
              className={inputStyle}
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Amount"
              value={newCategory.budget}
              onChange={handleInput}
            />
          </Form.Group>
        </Col>
      )}
      {newCategory.fixed && !newCategory.hasSubcategory && (
        <div className="d-flex flex-column">
          <Col className="col-12 col-md-8">
            <Form.Group controlId="frequency" className={formGroupStyle}>
              <Form.Label>How often does this occur?</Form.Label>
              <Form.Select
                className={inputStyle}
                value={newCategory.frequency}
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
            <Form.Group controlId="dueDate" className={formGroupStyle}>
              <Form.Label>What day of the month are you charged?</Form.Label>
              <Form.Control
                className={inputStyle}
                type="number"
                min={1}
                max={31}
                value={newCategory.dueDate}
                onChange={handleInput}
              />
            </Form.Group>
          </Col>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailsForm;
