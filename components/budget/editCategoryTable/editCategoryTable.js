import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useContext, useRef, useState } from "react";
import AddCategoryModal from "./addCategoryModal";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorModal from "@/components/layout/errorModal";
import { IncomeContext } from "@/contexts/IncomeContext";

const EditCategoryTable = ({ setEditCategories, monthInfo }) => {
  const { categories, deleteCategory, updateCategories } =
    useContext(CategoriesContext);
  const { transactions, updateTransactions } = useContext(TransactionsContext);
  const { getMonthIncome } = useContext(IncomeContext);
  const [addCategoryClicked, setAddCategoryClicked] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  // categoryValues is a reference array set up to update multiple categories at the same time
  // It needs to survive the re-renders that occur each time a category changes
  const categoryValues = useRef([]);

  const updateCategoryTable = async (e) => {
    setUpdatingCategories(true);

    try {
      e.preventDefault();

      setEditCategories(false);

      // If any category was edited, make a PUT request to the categories API endpoint
      if (categoryValues.current.length > 0) {
        // Maps through the categories array and if the category matches an editted category in categoryValues, replace that category
        const updated = categories.map((category) => {
          const foundIndex = categoryValues.current.findIndex((cat) => {
            return cat.id === category.id;
          });

          // Maps through the transactions array and if a category has a transaction that matches the changed category, change that transaction's category
          if (foundIndex !== -1) {
            if (category.fixed) {
              // Flag the category that was updated
              categoryValues.current[foundIndex].updated = true;

              return categoryValues.current[foundIndex];
            } else {
              let anyCategoryNameChanged = false;

              const updatedTransactions = transactions.map((transaction) => {
                if (transaction.category === category.name) {
                  if (
                    category.id === categoryValues.current[foundIndex].id &&
                    transaction.category !==
                      categoryValues.current[foundIndex].name
                  ) {
                    // Update the transaction's category
                    transaction.category =
                      categoryValues.current[foundIndex].name;

                    // Set a flag that there was a change to the category
                    transaction.changedCategory = true;

                    anyCategoryNameChanged = true;
                  }

                  return transaction;
                } else if (
                  transaction.category !== category.name &&
                  category.hasSubcategory
                ) {
                  category.subcategories.map((subCategory) => {
                    if (transaction.category === subCategory.name) {
                      if (categoryValues.current[foundIndex].hasSubcategory) {
                        const newSubcategory = categoryValues.current[
                          foundIndex
                        ].subcategories.find(
                          (subCat) => subCat.id === subCategory.id
                        );

                        if (transaction.category !== newSubcategory.name) {
                          // Update the transaction's category
                          transaction.category = newSubcategory.name;

                          // Set a flag that there was a change to the category
                          transaction.changedCategory = true;

                          anyCategoryNameChanged = true;
                        }
                      }
                    }
                  });

                  return transaction;
                } else {
                  return transaction;
                }
              });

              if (anyCategoryNameChanged) {
                const changedTransactions = updatedTransactions.filter(
                  (transaction) => transaction.changedCategory
                );

                updateTransactions(changedTransactions);
              }

              // Flag the category that was updated
              categoryValues.current[foundIndex].updated = true;

              return categoryValues.current[foundIndex];
            }
          } else {
            return category;
          }
        });

        const totalIncome = getMonthIncome(monthInfo);
        const updatedCategories = updateGuiltFreeSpending(totalIncome, updated);

        // Updates the categories array with the editted categories by sending a PUT request to the API
        const changedCategories = updatedCategories.filter(
          (category) => category.updated
        );

        await updateCategories(changedCategories);
      }

      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setUpdatingCategories(false);
    }
  };

  const updateCategoryValues = (updatedCategory) => {
    const foundIndex = categoryValues.current.findIndex((category) => {
      return category.id === updatedCategory.id;
    });

    if (foundIndex !== -1) {
      categoryValues.current[foundIndex] = updatedCategory;
    } else {
      categoryValues.current.push(updatedCategory);
    }
  };

  const addNewCategory = () => {
    setAddCategoryClicked(true);
  };

  const addCategoryProps = {
    addCategoryClicked: addCategoryClicked,
    setAddCategoryClicked: setAddCategoryClicked,
  };

  const editCategoryProps = {
    deleteCategory: deleteCategory,
    updateCategoryValues: updateCategoryValues,
  };

  const closeEdit = () => {
    setEditCategories(false);
  };

  return (
    <>
      <Form onSubmit={updateCategoryTable}>
        <Table striped bordered className="mx-auto">
          <thead>
            <tr className="table-dark d-flex">
              <th className="col-7 col-md-8">
                Category{" "}
                <Button
                  className="btn-sm mx-lg-2"
                  id="save-all-btn"
                  onClick={addNewCategory}
                >
                  Add New
                </Button>
              </th>
              <th className="col-3 col-md-2">Budget</th>
              <th className="col-2 col-md-2">Color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="bg-secondary text-white" colSpan={1}>
                Fixed Expenses
              </th>
            </tr>
            {categories.map(
              (category) =>
                category.fixed && (
                  <EditCategoryRow
                    key={category.id}
                    category={category}
                    {...editCategoryProps}
                  />
                )
            )}
            <tr>
              <th className="bg-secondary text-white" colSpan={1}>
                Changing Expenses
              </th>
            </tr>
            {categories.map(
              (category) =>
                !category.fixed && (
                  <EditCategoryRow
                    key={category.id}
                    category={category}
                    {...editCategoryProps}
                  />
                )
            )}
          </tbody>
        </Table>

        <Row>
          <Col className="text-end">
            <Button
              id="cancel-save-btn"
              variant="secondary"
              className="mx-4"
              onClick={closeEdit}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Col>
        </Row>
      </Form>

      <AddCategoryModal {...addCategoryProps} />

      <Modal show={updatingCategories} backdrop="static" centered>
        <LoadingMessage message="Updating these categories" />
      </Modal>

      <ErrorModal
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
      />
    </>
  );
};

export default EditCategoryTable;
