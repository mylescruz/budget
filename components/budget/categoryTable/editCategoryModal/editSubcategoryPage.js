import { Button, Form } from "react-bootstrap";

const EditSubcategoryPage = ({
  editedCategory,
  setEditedCategory,
  editedSubcategory,
  setEditedSubcategory,
  backToDetails,
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
          const subcategoryActual = editedSubcategory.actual * 100;
          subcategoriesTotal += subcategoryActual;

          return { ...editedSubcategory, actual: subcategoryActual };
        } else {
          subcategoriesTotal += subcategory.actual;
          return subcategory;
        }
      }
    );

    setEditedCategory({
      ...editedCategory,
      budget: editedCategory.fixed
        ? subcategoriesTotal / 100
        : editedCategory.budget,
      actual: editedCategory.fixed
        ? subcategoriesTotal / 100
        : editedCategory.actual,
      subcategories: updatedSubcategories,
    });

    setPage("details");
  };

  const deleteSubcategory = () => {
    let categoryBudget = editedCategory.budget;
    let categoryActual = editedCategory.actual;

    if (editedCategory.fixed) {
      categoryBudget =
        (categoryBudget * 100 - editedSubcategory.actual * 100) / 100;
      categoryActual -= editedSubcategory.actual * 100;
    }

    const updatedCategory = {
      ...editedCategory,
      budget: categoryBudget,
      actual: categoryActual,
      subcategories: editedCategory.subcategories.filter(
        (sub) => sub.id !== editedSubcategory.id
      ),
    };

    if (updatedCategory.subcategories.length === 0) {
      updatedCategory.budget = "";
      updatedCategory.dayOfMonth = "";
    }

    setEditedCategory(updatedCategory);

    setPage("details");
  };

  return (
    <div>
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
      {editedCategory.fixed && (
        <div>
          <Form.Group controlId="actual" className="my-2">
            <Form.Label>Actual Amount</Form.Label>
            <Form.Control
              type="number"
              placeholder="Amount"
              value={editedSubcategory.actual}
              onChange={handleInput}
            />
          </Form.Group>
          <Form.Group controlId="dayOfMonth" className="my-2">
            <Form.Label>What day of the month are you charged?</Form.Label>
            <Form.Control
              className="h-100 w-25"
              type="number"
              min={1}
              max={31}
              value={editedSubcategory.dayOfMonth}
              onChange={handleInput}
            />
          </Form.Group>
        </div>
      )}
      <Button
        variant="primary"
        className="w-100 mt-2"
        disabled={
          editedSubcategory.name === "" ||
          (editedCategory.fixed &&
            (editedSubcategory.actual === "" ||
              editedSubcategory.actual <= 0 ||
              editedSubcategory.dayOfMonth === "" ||
              editedSubcategory.dayOfMonth > 31 ||
              editedSubcategory.dayOfMonth < 1 ||
              !editedSubcategory.dayOfMonth))
        }
        onClick={saveSubcategory}
      >
        Update Subcategory
      </Button>
      <div className="w-100 d-flex justify-content-between mt-4">
        <Button variant="secondary" onClick={backToDetails}>
          Back
        </Button>
        <Button
          variant="danger"
          disabled={!editedCategory.fixed && editedSubcategory.actual !== 0}
          onClick={deleteSubcategory}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default EditSubcategoryPage;
