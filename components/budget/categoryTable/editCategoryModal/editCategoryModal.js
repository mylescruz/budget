import ErrorMessage from "@/components/layout/errorMessage";
import LoadingMessage from "@/components/layout/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, Table } from "react-bootstrap";
import AddSubcategoryPage from "./addSubcategoryPage";
import EditSubcategoryPage from "./editSubcategoryPage";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarFormatter from "@/helpers/dollarFormatter";

const EditCategoryModal = ({
  category,
  dateInfo,
  editCategoryClicked,
  setEditCategoryClicked,
}) => {
  const { getCategories, putCategory, deleteCategory } =
    useContext(CategoriesContext);
  const { transactions, updateTransactions } = useContext(TransactionsContext);

  console.log(category);
  const [editedCategory, setEditedCategory] = useState(category);

  const [editedSubcategory, setEditedSubcategory] = useState(null);
  const [nameChange, setNameChange] = useState({
    category: false,
    subcategory: false,
  });
  const [page, setPage] = useState("details");
  const [status, setStatus] = useState("editing");

  const handleInput = (e) => {
    const id = e.target.id;

    if (id === "name") {
      setNameChange({ ...nameChange, category: true });
    }

    setEditedCategory({ ...editedCategory, [id]: e.target.value });
  };

  const openAddSubcategoryPage = () => {
    setPage("addSubcategory");
  };

  const openEditSubcategoryPage = (subcategory) => {
    setEditedSubcategory({
      ...subcategory,
      actual: subcategory.actual,
      oldName: subcategory.name,
    });
    setPage("editSubcategory");
  };

  const updateCategory = async () => {
    setStatus("updating");

    try {
      await putCategory({
        ...editedCategory,
        month: dateInfo.month,
        year: dateInfo.year,
      });

      if (
        nameChange.category &&
        !editedCategory.fixed &&
        editedCategory.actual > 0
      ) {
        const updatedTransactions = transactions
          .filter((transaction) => transaction.category === category.name)
          .map((transaction) => {
            return { ...transaction, category: editedCategory.name };
          });

        await updateTransactions(updatedTransactions);
      }

      if (
        nameChange.subcategory &&
        !editedCategory.fixed &&
        editedCategory.actual > 0
      ) {
        const changedSubcategories = editedCategory.subcategories.filter(
          (subcategory) => subcategory.nameChanged
        );

        for (const subcategory of changedSubcategories) {
          const updatedTransactions = transactions
            .filter(
              (transaction) => transaction.category === subcategory.oldName
            )
            .map((transaction) => {
              return { ...transaction, category: subcategory.name };
            });

          await updateTransactions(updatedTransactions);
        }
      }

      // Fetch the updated categories to show changes to the Fun Money category's budget
      await getCategories(dateInfo.month, dateInfo.year);

      closeEditCategoryModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  // Delete category from current budget
  const removeCategory = async () => {
    setStatus("deleting");

    try {
      // Removes a category from the categories array by sending a DELETE request to the API
      await deleteCategory({
        ...category,
        month: dateInfo.month,
        year: dateInfo.year,
      });

      // Fetch the updated categories to show changes to the Fun Money category's budget
      await getCategories(dateInfo.month, dateInfo.year);

      closeEditCategoryModal();
    } catch (error) {
      setStatus("error");
      console.error(error);
      return;
    }
  };

  const backToDetails = () => {
    setPage("details");
  };

  const closeEditCategoryModal = () => {
    setStatus("editing");
    setEditCategoryClicked(false);
  };

  return (
    <Modal show={editCategoryClicked} onHide={closeEditCategoryModal} centered>
      {status !== "updating" && status !== "deleting" && (
        <>
          <Modal.Header closeButton>
            <Modal.Title>
              {page === "details" && <span>Edit {category.name}</span>}
              {page === "addSubcategory" && <span>Add new subcategory</span>}
              {page === "editSubcategory" && <span>Edit a subcategory</span>}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {page === "details" && (
              <div>
                <Row className="d-flex align-items-center">
                  <Col className="col-12 col-md-8">
                    <Form.Group controlId="name" className="mb-2">
                      <Form.Label>Category Name</Form.Label>
                      <Form.Control
                        className="h-100"
                        type="text"
                        value={editedCategory.name}
                        onChange={handleInput}
                        disabled={editedCategory.noDelete}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col className="col-12 col-md-4">
                    <Form.Group controlId="color" className="my-2">
                      <Form.Label>Color</Form.Label>
                      <Form.Control
                        type="color"
                        className="form-control-color"
                        value={editedCategory.color}
                        onChange={handleInput}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="d-flex allign-items-center">
                  <Col className="col-md-8">
                    <Form.Group controlId="budget" className="mb-2">
                      <Form.Label>Budget Amount</Form.Label>
                      <Form.Control
                        className="h-100"
                        type="number"
                        min={editedCategory.noDelete ? "-Infinity" : "0.01"}
                        step={0.01}
                        value={editedCategory.budget}
                        onChange={handleInput}
                        disabled={
                          (editedCategory.subcategories.length > 0 &&
                            editedCategory.fixed) ||
                          editedCategory.noDelete
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col className="col-md-4">
                    <Form.Group controlId="fixed" className="mb-2">
                      <Form.Label>Fixed Category</Form.Label>
                      <Form.Control
                        className="h-100"
                        type="text"
                        value={editedCategory.fixed ? "Yes" : "No"}
                        disabled={true}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {editedCategory.fixed &&
                  editedCategory.subcategories.length === 0 && (
                    <Form.Group controlId="dayOfMonth" className="mb-2">
                      <Form.Label>
                        What day of the month are you charged?
                      </Form.Label>
                      <Form.Control
                        className="h-100 w-25"
                        type="number"
                        min={1}
                        max={31}
                        value={editedCategory.dayOfMonth}
                        onChange={handleInput}
                      />
                    </Form.Group>
                  )}

                {(editedCategory.fixed ||
                  (!editedCategory.fixed && editedCategory.actual === 0) ||
                  (!editedCategory.fixed &&
                    editedCategory.subcategories.length > 0)) && (
                  <div className="my-2">
                    <p className="text-center fw-bold my-0">Subcategories</p>
                    <div className="mt-1 text-center">
                      <Button size="sm" onClick={openAddSubcategoryPage}>
                        Add New
                      </Button>
                    </div>
                  </div>
                )}

                {editedCategory.subcategories.length > 0 && (
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Actual</th>
                        {editedCategory.fixed && <th>Day</th>}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedCategory.subcategories.map((subcategory) => (
                        <tr key={subcategory.id}>
                          <td>{subcategory.name}</td>
                          <td>{dollarFormatter(subcategory.actual)}</td>
                          {editedCategory.fixed && (
                            <td>{subcategory.dayOfMonth}</td>
                          )}
                          <td
                            onClick={() => {
                              openEditSubcategoryPage(subcategory);
                            }}
                            className="clicker"
                          >
                            &#8286;
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                <div className="text-center mt-4">
                  <Button
                    className="w-100"
                    disabled={
                      editedCategory.name === "" ||
                      (!editedCategory.noDelete &&
                        editedCategory.budget <= 0) ||
                      (!editedCategory.fixed && editedCategory.budget === "") ||
                      (editedCategory.fixed &&
                        editedCategory.subcategories.length === 0 &&
                        (editedCategory.budget === "" ||
                          editedCategory.dayOfMonth === "" ||
                          editedCategory.dayOfMonth < 1 ||
                          editedCategory.dayOfMonth > 31))
                    }
                    onClick={updateCategory}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {page === "addSubcategory" && (
              <div>
                <AddSubcategoryPage
                  editedCategory={editedCategory}
                  setEditedCategory={setEditedCategory}
                  backToDetails={backToDetails}
                  setPage={setPage}
                />
              </div>
            )}

            {page === "editSubcategory" && (
              <div>
                <EditSubcategoryPage
                  editedCategory={editedCategory}
                  setEditedCategory={setEditedCategory}
                  editedSubcategory={editedSubcategory}
                  setEditedSubcategory={setEditedSubcategory}
                  backToDetails={backToDetails}
                  setPage={setPage}
                  nameChange={nameChange}
                  setNameChange={setNameChange}
                />
              </div>
            )}

            {status === "error" && <ErrorMessage />}
          </Modal.Body>
          {page === "details" && (
            <Modal.Footer>
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={closeEditCategoryModal}>
                  Cancel
                </Button>
                {!editedCategory.noDelete && (
                  <Button
                    variant="danger"
                    disabled={
                      (!editedCategory.fixed && editedCategory.actual !== 0) ||
                      editedCategory.subcategories.length !== 0
                    }
                    onClick={removeCategory}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Modal.Footer>
          )}
        </>
      )}
      {status === "updating" && (
        <LoadingMessage message="Updating the category's details" />
      )}
      {status === "deleting" && (
        <LoadingMessage message={`Deleting the category ${category.name}`} />
      )}
    </Modal>
  );
};

export default EditCategoryModal;
