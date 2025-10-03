import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import currencyFormatter from "@/helpers/currencyFormatter";
import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, Container } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const AddCategoryModal = ({
  dateInfo,
  addCategoryClicked,
  setAddCategoryClicked,
}) => {
  const emptyCategory = {
    name: "",
    color: "#000000",
    budget: "",
    actual: 0,
    fixed: false,
    hasSubcategory: false,
    subcategories: [],
  };

  const emptySubcategory = {
    id: uuidv4(),
    name: "",
    actual: 0,
  };

  const { getCategories, postCategory } = useContext(CategoriesContext);
  const [newCategory, setNewCategory] = useState(emptyCategory);
  const [newSubcategory, setNewSubcategory] = useState(emptySubcategory);
  const [subcategoryTotal, setSubcategoryTotal] = useState(0);
  const [addingCategory, setAddingCategory] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setNewCategory({ ...newCategory, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input === "") {
      setNewCategory({ ...newCategory, budget: input });
    } else {
      setNewCategory({ ...newCategory, budget: parseFloat(input) });
    }
  };

  const handleSubcategoryInput = (e) => {
    setNewSubcategory({ ...newSubcategory, name: e.target.value });
  };

  const handleSubcategoryBudget = (e) => {
    const input = e.target.value;

    if (input === "") {
      setNewSubcategory({ ...newSubcategory, actual: input });
    } else {
      setNewSubcategory({ ...newSubcategory, actual: parseFloat(input) });
    }
  };

  const handleSubcategoryChecked = (e) => {
    if (e.target.checked) {
      setNewCategory({ ...newCategory, hasSubcategory: true });
    } else {
      setNewCategory({
        ...newCategory,
        hasSubcategory: false,
        subcategories: [],
      });
    }
  };

  const handleFixed = (e) => {
    if (e.target.checked && newCategory.hasSubcategory) {
      setNewCategory({ ...newCategory, budget: 0, fixed: true });
    } else if (e.target.checked && !newCategory.hasSubcategory) {
      setNewCategory({ ...newCategory, fixed: true });
    } else {
      setNewCategory({ ...newCategory, fixed: false });
    }
  };

  const closeModal = () => {
    setNewCategory(emptyCategory);

    setSubcategoryTotal(0);

    setAddCategoryClicked(false);
  };

  const addToSubcategories = () => {
    if (newCategory.fixed) {
      const fixedBudget = subcategoryTotal + newSubcategory.actual;

      // If the new category is fixed, set the budget and actual equal to the subcategory total and add the subcategory to the array
      setNewCategory({
        ...newCategory,
        budget: fixedBudget,
        actual: fixedBudget,
        hasSubcategory: true,
        subcategories: [...newCategory.subcategories, newSubcategory],
      });

      setSubcategoryTotal(fixedBudget);
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

  const addNewCategory = async (e) => {
    e.preventDefault();

    try {
      // A fixed category's budget and actual spent are the same
      if (!newCategory.hasSubcategory && newCategory.fixed)
        newCategory.actual = newCategory.budget;

      // Adds the new category to the category array by sending a POST request to the API
      await postCategory(newCategory);

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      closeModal();

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setAddingCategory(false);
    }
  };

  return (
    <Modal show={addCategoryClicked} onHide={closeModal} centered>
      {!addingCategory ? (
        <>
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
                      disabled={newCategory.subcategories.length > 0}
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
                      disabled={newCategory.subcategories.length > 0}
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
                        <Form.Group
                          controlId="subcategory-budget"
                          className="my-2"
                        >
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

              {errorOccurred && <ErrorMessage />}
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
        </>
      ) : (
        <LoadingMessage message="Adding the new category" />
      )}
    </Modal>
  );
};

export default AddCategoryModal;
