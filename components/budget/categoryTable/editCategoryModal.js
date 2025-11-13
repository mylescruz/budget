import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import centsToDollars from "@/helpers/centsToDollars";
import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, Container } from "react-bootstrap";
import AddSubcategoryForm from "./addSubcategoryForm";

const EditCategoryModal = ({
  category,
  dateInfo,
  editCategoryClicked,
  setEditCategoryClicked,
}) => {
  const { getCategories, putCategory, deleteCategory } =
    useContext(CategoriesContext);

  const [updatedCategory, setUpdatedCategory] = useState({
    ...category,
    budget:
      category.hasSubcategory && category.fixed
        ? category.subcategories.reduce(
            (sum, current) => sum + current.actual,
            0
          ) / 100
        : category.budget / 100,
  });

  const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);
  const [makingChanges, setMakingChanges] = useState(true);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setUpdatedCategory({ ...updatedCategory, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input === "") {
      setUpdatedCategory({ ...updatedCategory, budget: input });
    } else {
      setUpdatedCategory({ ...updatedCategory, budget: parseFloat(input) });
    }
  };

  const handleSubcategoryChecked = (e) => {
    if (e.target.checked) {
      setUpdatedCategory({ ...updatedCategory, hasSubcategory: true });
    } else {
      setUpdatedCategory({
        ...updatedCategory,
        hasSubcategory: false,
        subcategories: [],
      });
    }
  };

  const handleFixed = (e) => {
    if (e.target.checked && updatedCategory.hasSubcategory) {
      setUpdatedCategory({
        ...updatedCategory,
        budget: category.subcategories.reduce(
          (sum, current) => sum + current.actual,
          0
        ),
        fixed: true,
      });
    } else if (e.target.checked && !updatedCategory.hasSubcategory) {
      setUpdatedCategory({ ...updatedCategory, fixed: true });
    } else {
      setUpdatedCategory({ ...updatedCategory, fixed: false });
    }
  };

  const addSubcategory = () => {
    setAddSubcategoryClicked(true);
  };

  const updateCategory = async (e) => {
    e.preventDefault();

    setMakingChanges(false);
    setUpdatingCategory(true);

    try {
      // A fixed category's budget and actual spent are the same
      if (!updatedCategory.hasSubcategory && updatedCategory.fixed) {
        updatedCategory.actual = updatedCategory.budget;
      }

      // PUT request to update category in the database
      await putCategory({
        ...updatedCategory,
        budget: updatedCategory.budget * 100,
        month: dateInfo.month,
        year: dateInfo.year,
      });

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      closeEditCategoryModal();

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Delete category from current budget
  const removeCategory = async () => {
    setDeletingCategory(true);

    try {
      // Removes a category from the categories array by sending a DELETE request to the API
      await deleteCategory({
        ...category,
        month: dateInfo.month,
        year: dateInfo.year,
      });

      // Fetch the categories to update the state for the categories table
      await getCategories(dateInfo.month, dateInfo.year);

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setDeletingCategory(false);
    }
  };

  // Remove the selected subcategory from the category's subcategories
  const removeSubcategory = async (subcategory) => {
    let categoryBudget = updatedCategory.budget;
    let categoryActual = updatedCategory.actual;

    console.log("B: ", categoryBudget);
    console.log("A: ", categoryActual);
    if (updatedCategory.fixed) {
      categoryBudget = (categoryBudget * 100 - subcategory.actual) / 100;
      categoryActual -= subcategory.actual;
    }

    console.log("B: ", categoryBudget);
    console.log("A: ", categoryActual);

    setUpdatedCategory({
      ...updatedCategory,
      budget: categoryBudget,
      actual: categoryActual,
      subcategories: updatedCategory.subcategories.filter(
        (sub) => sub.id !== subcategory.id
      ),
    });
  };

  const closeEditCategoryModal = () => {
    setEditCategoryClicked(false);
  };

  return (
    <Modal show={editCategoryClicked} onHide={closeEditCategoryModal} centered>
      {makingChanges && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>Edit {category.name}</Modal.Title>
          </Modal.Header>

          <Form onSubmit={updateCategory}>
            <Modal.Body>
              <Form.Group controlId="name" className="mb-2">
                <Form.Label>Category Name</Form.Label>
                <Form.Control
                  className="h-100"
                  type="text"
                  value={updatedCategory.name}
                  onChange={handleInput}
                  required
                />
              </Form.Group>
              <Form.Group controlId="budget" className="my-2">
                <Form.Label>Budget Amount</Form.Label>
                <Form.Control
                  className="h-100"
                  type="number"
                  min={updatedCategory.noDelete ? "-Infinity" : "0.01"}
                  step="0.01"
                  value={updatedCategory.budget}
                  onChange={handleNumInput}
                  disabled={
                    (updatedCategory.hasSubcategory && updatedCategory.fixed) ||
                    updatedCategory.noDelete
                  }
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
                      value={updatedCategory.color}
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
                      checked={updatedCategory.fixed}
                      value={updatedCategory.fixed}
                      onChange={handleFixed}
                      disabled={updatedCategory.subcategories.length > 0}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="hasSubcategory" className="my-2">
                    <Form.Label>Subcategories?</Form.Label>
                    <Form.Check
                      className="h-100"
                      type="checkbox"
                      checked={updatedCategory.hasSubcategory}
                      value={updatedCategory.hasSubcategory}
                      onChange={handleSubcategoryChecked}
                      disabled={updatedCategory.subcategories.length > 0}
                    />
                  </Form.Group>
                </Col>
              </Row>
              {updatedCategory.hasSubcategory && (
                <Container className="d-flex flex-column mt-3">
                  <div className="d-flex align-items-center">
                    <h6 className="fw-bold">
                      Subcategories{" "}
                      <i
                        className="bi bi-plus-circle plus"
                        onClick={addSubcategory}
                      />
                    </h6>
                  </div>
                  {updatedCategory.subcategories.map((subcategory) => (
                    <Row key={subcategory.id} className="my-1 d-flex flex-row">
                      <Col className="col-6">{subcategory.name}</Col>
                      <Col className="col-4">
                        {centsToDollars(subcategory.actual)}
                      </Col>
                      {(category.fixed ||
                        (!category.fixed && subcategory.actual === 0)) && (
                        <Col className="col-2">
                          <i
                            className="bi bi-trash delete"
                            onClick={() => {
                              removeSubcategory(subcategory);
                            }}
                          />
                        </Col>
                      )}
                    </Row>
                  ))}
                </Container>
              )}

              {addSubcategoryClicked && (
                <AddSubcategoryForm
                  updatedCategory={updatedCategory}
                  setUpdatedCategory={setUpdatedCategory}
                  setAddSubcategoryClicked={setAddSubcategoryClicked}
                />
              )}

              {errorOccurred && <ErrorMessage />}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              {!category.noDelete && (
                <Button
                  variant="danger"
                  disabled={
                    (!category.fixed && category.actual !== 0) ||
                    updatedCategory.subcategories.length !== 0
                  }
                  onClick={removeCategory}
                >
                  Delete
                </Button>
              )}
              <Button
                variant="primary"
                type="submit"
                disabled={
                  updatedCategory.hasSubcategory &&
                  updatedCategory.subcategories.length === 0
                }
              >
                Update
              </Button>
            </Modal.Footer>
          </Form>
        </>
      )}
      {updatingCategory && (
        <LoadingMessage message="Updating the category's details" />
      )}
      {deletingCategory && (
        <LoadingMessage message={`Deleting the category ${category.name}`} />
      )}
    </Modal>
  );
};

export default EditCategoryModal;
