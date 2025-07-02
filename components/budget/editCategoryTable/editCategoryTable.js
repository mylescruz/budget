import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import EditCategoryRow from "./editCategoryRow";
import { useContext, useRef, useState } from "react";
import AddCategoryModal from "./addCategoryModal";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import useIncome from "@/hooks/useIncome";
import { useSession } from "next-auth/react";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import LoadingMessage from "@/components/layout/loadingMessage";
import ErrorModal from "@/components/layout/errorModal";

const EditCategoryTable = ({ setEditCategories, monthInfo }) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const { categories, putCategories, deleteCategory } =
    useContext(CategoriesContext);
  const { transactions, updateTransactions } = useContext(TransactionsContext);
  const { getMonthIncome } = useIncome(session.user.username, monthInfo.year);
  const [addCategoryClicked, setAddCategoryClicked] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  /* 
        categoryValues is a reference array set up to update all the categories at the same time
        It needs to survive the re-renders that occur each time a category changes
    */
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
            let anyCategoryNameChanged = false;

            const updatedTransactions = transactions.map((transaction) => {
              if (transaction.category === category.name) {
                if (
                  category.id === categoryValues.current[foundIndex].id &&
                  transaction.category !==
                    categoryValues.current[foundIndex].name
                ) {
                  transaction.category =
                    categoryValues.current[foundIndex].name;
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
                        transaction.category = newSubcategory.name;
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
              updateTransactions(updatedTransactions);
            }

            return categoryValues.current[foundIndex];
          } else {
            return category;
          }
        });

        const totalIncome = getMonthIncome(monthInfo);
        const updatedCategories = updateGuiltFreeSpending(totalIncome, updated);

        // Updates the categories array with the editted categories by sending a PUT request to the API
        await putCategories(updatedCategories);
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
