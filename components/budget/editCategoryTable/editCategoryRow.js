import { useState } from "react";
import { Col, Form, Modal, Row } from "react-bootstrap";
import AddSubcategoryForm from "./addSubcategoryForm";
import EditSubcategoryRow from "./editSubcategoryRow";
import PopUp from "@/components/layout/popUp";
import LoadingMessage from "@/components/layout/loadingMessage";

const EditCategoryRow = ({
  category,
  deleteCategory,
  updateCategoryValues,
}) => {
  const [edittedCategory, setEdittedCategory] = useState(category);
  const [addSubcategoryClicked, setAddSubcategoryClicked] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // The only category that cannot be deleted
  const dontDelete = "Guilt Free Spending";

  const handleBudgetInput = (e) => {
    const input = e.target.value;
    const actualValue = edittedCategory.fixed ? input : edittedCategory.actual;

    if (input == "") {
      setEdittedCategory({
        ...edittedCategory,
        budget: input,
        actual: actualValue,
      });
      updateCategoryValues({ ...edittedCategory, budget: 0, actual: 0 });
    } else {
      setEdittedCategory({
        ...edittedCategory,
        budget: parseFloat(input),
        actual: parseFloat(actualValue),
      });
      updateCategoryValues({
        ...edittedCategory,
        budget: parseFloat(input),
        actual: parseFloat(actualValue),
      });
    }
  };

  const handleInput = (e) => {
    const property = e.target.name;
    const input = e.target.value;

    setEdittedCategory({ ...edittedCategory, [property]: input });
    updateCategoryValues({ ...edittedCategory, [property]: input });
  };

  const updateSubcategory = (subcategory) => {
    let budgetTotal = edittedCategory.budget;

    // Map through each subcategory and remove the current subcategory actual value and add the new value to the budget
    const updatedSubcategories = edittedCategory.subcategories.map((sub) => {
      if (sub.id === subcategory.id) {
        budgetTotal = parseFloat(
          (budgetTotal - sub.actual + subcategory.actual).toFixed(2)
        );
        return { ...sub, name: subcategory.name, actual: subcategory.actual };
      } else {
        return sub;
      }
    });

    /* 
            If the category is fixed, set the actual equal to the budget
            If not, keep it set to the category's current actual value
        */
    const actualTotal = edittedCategory.fixed
      ? budgetTotal
      : edittedCategory.actual;

    setEdittedCategory({
      ...edittedCategory,
      budget: budgetTotal,
      actual: actualTotal,
      hasSubcategory: true,
      subcategories: updatedSubcategories,
    });
    updateCategoryValues({
      ...edittedCategory,
      budget: budgetTotal,
      actual: actualTotal,
      hasSubcategory: true,
      subcategories: updatedSubcategories,
    });
  };

  const addSubcategory = () => {
    setAddSubcategoryClicked(true);
  };

  const removeCategory = async () => {
    setDeletingCategory(true);

    try {
      // Removes a category from the categories array by sending a DELETE request to the API
      await deleteCategory(category);
    } catch (error) {
      console.error(error);
      return;
    } finally {
      setDeletingCategory(false);
    }
  };

  const deleteSubcategory = (subcategory) => {
    // Remove the requested subcategory from the category's subcategories array
    const updatedSubcategories = edittedCategory.subcategories.filter((sub) => {
      return sub.id !== subcategory.id;
    });

    // Update the category's budget to remove the subcategory's actual value
    const budgetTotal = parseFloat(
      (edittedCategory.budget - subcategory.actual).toFixed(2)
    );

    // If the category is fixed, keep the actual value to the current budget
    // If the category isn't fixed, keep the current actual value
    const actualTotal = edittedCategory.fixed
      ? budgetTotal
      : edittedCategory.actual;

    // Updates the category's budget and actual value and set the hasSubcategory flag based on if there are any subcategories left
    setEdittedCategory({
      ...edittedCategory,
      budget: budgetTotal,
      actual: actualTotal,
      hasSubcategory: updatedSubcategories.length > 0,
      subcategories: updatedSubcategories,
    });
    updateCategoryValues({
      ...edittedCategory,
      budget: budgetTotal,
      actual: actualTotal,
      hasSubcategory: updatedSubcategories.length > 0,
      subcategories: updatedSubcategories,
    });
  };

  return (
    <>
      <tr className="d-flex">
        <th className="text-nowrap col-7 col-md-8">
          <Row className="w-100 d-flex align-items-center">
            <Col className="col-2">
              {edittedCategory.name === dontDelete ||
              edittedCategory.hasSubcategory ||
              (!edittedCategory.fixed && edittedCategory.actual !== 0) ? (
                edittedCategory.fixed ? (
                  <PopUp
                    title={`Delete the subcategories for ${edittedCategory.name} in order to delete this category`}
                    id={`category-${edittedCategory.id}-delete-info`}
                  >
                    <span>&#9432;</span>
                  </PopUp>
                ) : (
                  <PopUp
                    title={`There are ${edittedCategory.name} transactions for this month. Change those in order to delete this category`}
                    id={`category-${edittedCategory.id}-delete-info`}
                  >
                    <span>&#9432;</span>
                  </PopUp>
                )
              ) : (
                <i className="bi bi-trash delete" onClick={removeCategory} />
              )}
            </Col>
            <Col className="col-8 col-md-8">
              <Form.Control
                type="text"
                name="name"
                value={edittedCategory.name}
                onChange={handleInput}
                disabled={edittedCategory.name === dontDelete}
              />
            </Col>
            <Col className="col-2 text-end">
              <i className="bi bi-plus-circle plus" onClick={addSubcategory} />
            </Col>
          </Row>
        </th>
        <td className="col-3 col-md-2">
          <Form.Control
            type="number"
            name="budget"
            min="0"
            max="100000"
            step="0.01"
            className="px-1 text-end"
            value={edittedCategory.budget}
            onChange={handleBudgetInput}
            disabled={
              (edittedCategory.hasSubcategory && edittedCategory.fixed) ||
              edittedCategory.name === dontDelete
            }
          />
        </td>
        <td className="col-2 d-flex align-items-center justify-content-center">
          <Form.Control
            type="color"
            name="color"
            className="form-control-color"
            value={edittedCategory.color}
            onChange={handleInput}
          ></Form.Control>
        </td>
      </tr>
      {edittedCategory.hasSubcategory &&
        edittedCategory.subcategories.map((subcategory) => (
          <EditSubcategoryRow
            key={subcategory.id}
            subcategory={subcategory}
            fixed={edittedCategory.fixed}
            updateSubcategory={updateSubcategory}
            deleteSubcategory={deleteSubcategory}
          />
        ))}

      {addSubcategoryClicked && (
        <AddSubcategoryForm
          edittedCategory={edittedCategory}
          setEdittedCategory={setEdittedCategory}
          updateCategoryValues={updateCategoryValues}
          setAddSubcategoryClicked={setAddSubcategoryClicked}
        />
      )}

      <Modal show={deletingCategory} backdrop="static" centered>
        <LoadingMessage message="Deleting the category" />
      </Modal>
    </>
  );
};

export default EditCategoryRow;
