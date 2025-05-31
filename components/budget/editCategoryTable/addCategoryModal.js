import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useState } from "react";
import {
  Form,
  Button,
  Modal,
  Col,
  Row,
  FloatingLabel,
  Container,
} from "react-bootstrap";

const AddCategoryModal = ({
  postCategory,
  addCategoryClicked,
  setAddCategoryClicked,
}) => {
  const emptyCategory = {
    id: 0,
    name: "",
    color: "#000000",
    budget: "",
    actual: 0,
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const emptySubcategory = {
    id: 0,
    name: "",
    actual: 0,
  };

  const { categories } = useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
  const [subcategoryTotal, setSubcategoryTotal] = useState(0);

  const handleInput = (e) => {
    setNewCategory({ ...newCategory, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") setNewCategory({ ...newCategory, budget: input });
    else setNewCategory({ ...newCategory, budget: parseFloat(input) });
  };

  const handleSubcategoryInput = (e) => {
    setNewSubcategory({ ...newSubcategory, name: e.target.value });
  };

  const handleSubcategoryBudget = (e) => {
    const input = e.target.value;

    if (input == "") setNewSubcategory({ ...newSubcategory, actual: input });
    else setNewSubcategory({ ...newSubcategory, actual: parseFloat(input) });
  };

  const handleSubcategoryChecked = (e) => {
    if (e.target.checked)
      setNewCategory({ ...newCategory, hasSubcategory: true });
    else
      setNewCategory({
        ...newCategory,
        hasSubcategory: false,
        subcategories: [],
      });
  };

  const handleFixed = (e) => {
    if (e.target.checked) setNewCategory({ ...newCategory, fixed: true });
    else setNewCategory({ ...newCategory, fixed: false });
  };

  const closeModal = () => {
    setAddCategoryClicked(false);
  };

  const addNewCategory = (e) => {
    e.preventDefault();

    // A fixed category's budget and actual spent are the same
    if (!newCategory.hasSubcategory && newCategory.fixed)
      newCategory.actual = newCategory.budget;

    // Find the max ID in the categories array and add one for the new ID
    let maxID = 0;
    if (categories.length > 0)
      maxID = Math.max(...categories.map((category) => category.id));
    newCategory.id = maxID + 1;

    // Adds the new category to the category array by sending a POST request to the API
    postCategory(newCategory);

    closeModal();
  };

  const addToSubcategories = () => {
    // Find the max ID in the subcategories array and add one for the new ID
    let maxID = 0;
    if (newCategory.subcategories.length > 0)
      maxID = Math.max(...newCategory.subcategories.map((sub) => sub.id));
    newSubcategory.id = maxID + 1;

    setSubcategoryTotal(
      parseFloat((subcategoryTotal + newSubcategory.actual).toFixed(2))
    );

    if (newCategory.fixed) {
      // If the new category is fixed, set the budget and actual equal to the subcategory total and add the subcategory to the array
      setNewCategory({
        ...newCategory,
        budget: parseFloat(
          (subcategoryTotal + newSubcategory.actual).toFixed(2)
        ),
        actual: parseFloat(
          (subcategoryTotal + newSubcategory.actual).toFixed(2)
        ),
        hasSubcategory: true,
        subcategories: [...newCategory.subcategories, newSubcategory],
      });
    } else {
      // If the new category is not fixed, just add the subcategory to the array
      setNewCategory({
        ...newCategory,
        hasSubcategory: true,
        subcategories: [...newCategory.subcategories, newSubcategory],
      });
    }

    setNewSubcategory(emptySubcategory);
  };

  return (
    <Modal show={addCategoryClicked} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Enter new category information</Modal.Title>
      </Modal.Header>

      <Form onSubmit={addNewCategory}>
        <Modal.Body>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              className="h-100"
              type="text"
              value={newCategory.name}
              onChange={handleInput}
              required
            />
          </Form.Group>
          <Form.Group controlId="budget" className="my-2">
            <Form.Label>Budget Amount</Form.Label>
            <Form.Control
              className="h-100"
              type="number"
              min="0.01"
              step="0.01"
              value={
                newCategory.hasSubcategory && newCategory.fixed
                  ? subcategoryTotal
                  : newCategory.budget
              }
              onChange={handleNumInput}
              disabled={newCategory.hasSubcategory && newCategory.fixed}
              required
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group controlId="color" className="my-2">
                <Form.Label>Color</Form.Label>
                <Form.Control
                  type="color"
                  className="form-control-color"
                  value={newCategory.color}
                  onChange={handleInput}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="fixed" className="my-2">
                <Form.Label>Fixed?</Form.Label>
                <Form.Check
                  className="h-100"
                  type="checkbox"
                  value={newCategory.fixed}
                  onChange={handleFixed}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="hasSubcategory" className="my-2">
                <Form.Label>Subcategories?</Form.Label>
                <Form.Check
                  className="h-100"
                  type="checkbox"
                  value={newCategory.hasSubcategory}
                  onChange={handleSubcategoryChecked}
                />
              </Form.Group>
            </Col>
          </Row>
          {newCategory.hasSubcategory && (
            <Form.Group className="my-2">
              <Row>
                <Col className="col-5">
                  <Form.Group controlId="subcategory-name" className="my-2">
                    <Form.Label>Subcategory Name</Form.Label>
                    <Form.Control
                      className="h-100"
                      type="text"
                      value={newSubcategory.name}
                      onChange={handleSubcategoryInput}
                    />
                  </Form.Group>
                </Col>
                {newCategory.hasSubcategory && newCategory.fixed && (
                  <Col className="col-5">
                    <Form.Group controlId="subcategory-budget" className="my-2">
                      <Form.Label>Subcategory Budget</Form.Label>
                      <Form.Control
                        className="h-100"
                        type="number"
                        value={newSubcategory.actual}
                        onChange={handleSubcategoryBudget}
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col className="col-2 d-flex align-items-center">
                  <i
                    className="bi bi-plus-circle plus"
                    onClick={addToSubcategories}
                  ></i>
                </Col>
              </Row>
            </Form.Group>
          )}
          {newCategory.hasSubcategory && (
            <Container>
              {newCategory.subcategories.length > 0 && (
                <h6>Subcategories added</h6>
              )}
              {newCategory.subcategories.map((subcategory) => (
                <p key={subcategory.id} className="my-1">
                  {subcategory.name}
                  {newCategory.fixed &&
                    `: ${currencyFormatter.format(subcategory.actual)}`}
                </p>
              ))}
            </Container>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Form.Group className="my-2">
            <Row>
              <Col>
                <Button variant="secondary" onClick={closeModal}>
                  Close
                </Button>
              </Col>
              <Col>
                <Button variant="primary" type="submit">
                  Add
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
