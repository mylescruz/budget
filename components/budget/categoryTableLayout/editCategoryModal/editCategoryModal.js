import LoadingMessage from "@/components/ui/loadingMessage";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, Table } from "react-bootstrap";
import AddSubcategoryPage from "./addSubcategoryPage";
import EditSubcategoryPage from "./editSubcategoryPage";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import dollarFormatter from "@/helpers/dollarFormatter";
import dayFormatter from "@/helpers/dayFormatter";
import PopUp from "@/components/ui/popUp";
import { FIXED_FREQUENCIES_LIST } from "@/lib/constants/categories";
import handleObjectInput from "@/helpers/handleObjectInput";
import ErrorMessage from "@/components/ui/errorMessage";

const EditCategoryModal = ({
  editedCategory,
  setEditedCategory,
  dateInfo,
  modal,
  setModal,
}) => {
  const { categoriesRequest, putCategory, categoryNames } =
    useContext(CategoriesContext);
  const { updateTransactionsFromCategory } = useContext(TransactionsContext);

  const [editedSubcategory, setEditedSubcategory] = useState(null);
  const [page, setPage] = useState("details");
  const [formMeta, setFormMeta] = useState({ status: "idle", error: null });
  const [fieldChanges, setFieldChanges] = useState({
    name: false,
    budget: false,
  });

  // Create a new set to filter out the current category and subcategories' names in case a change is made to it other than its name
  const filteredNames = new Set(categoryNames);

  filteredNames.delete(editedCategory.currentName);

  if (editedCategory.subcategories.length > 0) {
    editedCategory.subcategories.forEach((subcategory) =>
      filteredNames.delete(subcategory.name),
    );
  }

  const handleInput = (e) => {
    const id = e.target.id;

    if (id === "name") {
      setFieldChanges((prev) => ({ ...prev, name: true }));
    } else if (id === "budget") {
      setFieldChanges((prev) => ({ ...prev, budget: true }));
    }

    handleObjectInput({ e, setObject: setEditedCategory });
  };

  const openAddSubcategoryPage = () => {
    setPage("addSubcategory");
  };

  const openEditSubcategoryPage = (subcategory) => {
    setEditedSubcategory({
      ...subcategory,
      budget: subcategory.budget,
      currentName: subcategory.name,
    });
    setPage("editSubcategory");
  };

  // Validate whether the inputted category name has been taken or not
  const validateCategoryName = (categoryName) => {
    let isValid = true;

    if (filteredNames.has(categoryName)) {
      setFormMeta({
        status: "idle",
        error: `There is already a category named ${categoryName}`,
      });

      isValid = false;
    } else {
      setFormMeta({
        status: "idle",
        error: null,
      });
    }

    return isValid;
  };

  const updateCategory = async () => {
    const validName = validateCategoryName(editedCategory.name);

    if (!validName) {
      return;
    }

    setFormMeta({ status: "loading", error: null });

    try {
      const updatedTransactions = await putCategory({
        ...editedCategory,
        month: dateInfo.month,
        year: dateInfo.year,
      });

      if (updatedTransactions) {
        updateTransactionsFromCategory(updatedTransactions);
      }

      closeEditCategoryModal();
    } catch (error) {
      setFormMeta({ status: "idle", error: error.message });
    }
  };

  const openDeleteModal = () => {
    setModal("delete");
  };

  const backToDetails = () => {
    setPage("details");
  };

  const closeEditCategoryModal = () => {
    setFormMeta({ status: "idle", error: null });
    setModal("none");
  };

  // Conditions to determine if a category can be deleted
  const noTransactions = !editedCategory.fixed && editedCategory.actual === 0;
  const funMoney = editedCategory.noDelete;
  const fixed = editedCategory.fixed;

  const ableToDelete = (noTransactions || fixed) && !funMoney;

  return (
    <Modal show={modal === "edit"} onHide={closeEditCategoryModal} centered>
      {formMeta.status === "idle" && (
        <>
          <Modal.Header className="d-flex justify-content-between">
            <Modal.Title>
              {page === "details" && (
                <span>Edit {editedCategory.currentName}</span>
              )}
              {page === "addSubcategory" && <span>Add new subcategory</span>}
              {page === "editSubcategory" && <span>Edit a subcategory</span>}
            </Modal.Title>
            {page === "details" && (
              <div>
                {ableToDelete ? (
                  <Button variant="danger" onClick={openDeleteModal}>
                    Delete
                  </Button>
                ) : (
                  <PopUp
                    id="deletePopUp"
                    title={
                      editedCategory.noDelete
                        ? "Use this to track the money you can spend after all other expenses are covered."
                        : "This category has transactions and cannot be deleted"
                    }
                  >
                    <i className="bi bi-info-circle" />
                  </PopUp>
                )}
              </div>
            )}
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
                    <div>
                      <Col className="col-12 col-md-8">
                        <Form.Group controlId="frequency" className="mb-2">
                          <Form.Label>How often are you charged?</Form.Label>
                          <Form.Select
                            className="h-100"
                            value={editedCategory.frequency}
                            onChange={handleInput}
                            required
                          >
                            {FIXED_FREQUENCIES_LIST.map((frequency) => (
                              <option key={frequency} value={frequency}>
                                {frequency}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col className="col-12 col-md-8">
                        <Form.Group controlId="dueDate" className="mb-2">
                          <Form.Label>
                            What day of the month are you charged?
                          </Form.Label>
                          <Form.Control
                            className="h-100"
                            type="number"
                            min={1}
                            max={31}
                            value={editedCategory.dueDate}
                            onChange={handleInput}
                          />
                        </Form.Group>
                      </Col>
                    </div>
                  )}

                {(editedCategory.fixed ||
                  (!editedCategory.fixed && editedCategory.actual === 0) ||
                  (!editedCategory.fixed &&
                    editedCategory.subcategories.length > 0)) && (
                  <div className="my-2 d-flex justify-content-between align-items-center">
                    <p className="fw-bold my-0">Subcategories</p>
                    <div className="mt-1">
                      <Button size="sm" onClick={openAddSubcategoryPage}>
                        + Add New
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
                        {editedCategory.fixed && <th>Due</th>}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedCategory.subcategories
                        .filter((subcategory) => !subcategory.deleted)
                        .map((subcategory) => (
                          <tr key={subcategory._id}>
                            <td>{subcategory.name}</td>
                            <td>
                              {editedCategory.fixed
                                ? dollarFormatter(subcategory.budget)
                                : dollarFormatter(subcategory.actual)}
                            </td>
                            {editedCategory.fixed && (
                              <td>{dayFormatter(subcategory.dueDate)}</td>
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
                <div className="text-center mt-4"></div>
              </div>
            )}

            {page === "addSubcategory" && (
              <div>
                <AddSubcategoryPage
                  editedCategory={editedCategory}
                  setEditedCategory={setEditedCategory}
                  backToDetails={backToDetails}
                  setPage={setPage}
                  validateCategoryName={validateCategoryName}
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
                  setFieldChanges={setFieldChanges}
                  setPage={setPage}
                  validateCategoryName={validateCategoryName}
                  backToDetails={backToDetails}
                />
              </div>
            )}

            {formMeta.error && <ErrorMessage message={formMeta.error} />}
          </Modal.Body>
          {page === "details" && (
            <Modal.Footer>
              <div className="w-100 d-flex justify-content-between">
                <Button variant="secondary" onClick={closeEditCategoryModal}>
                  Cancel
                </Button>
                <Button
                  disabled={
                    editedCategory.name === "" ||
                    (!editedCategory.noDelete && editedCategory.budget <= 0) ||
                    (!editedCategory.fixed && editedCategory.budget === "") ||
                    (editedCategory.fixed &&
                      editedCategory.subcategories.length === 0 &&
                      (editedCategory.budget === "" ||
                        editedCategory.dueDate === "" ||
                        editedCategory.dueDate < 1 ||
                        editedCategory.dueDate > 31))
                  }
                  onClick={updateCategory}
                >
                  Save
                </Button>
              </div>
            </Modal.Footer>
          )}
        </>
      )}
      {formMeta.status === "loading" && (
        <LoadingMessage message={categoriesRequest.message} />
      )}
    </Modal>
  );
};

export default EditCategoryModal;
