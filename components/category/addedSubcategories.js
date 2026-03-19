import { Col, Row } from "react-bootstrap";

const AddedSubcategories = ({ newCategory, setNewCategory }) => {
  const deleteSubcategory = (subcategory) => {
    setNewCategory({
      ...newCategory,
      subcategories: newCategory.subcategories.filter(
        (subCat) => subCat._id !== subcategory._id,
      ),
    });
  };

  return (
    <div>
      <Row className="fw-bold">
        <Col className={`${newCategory.fixed ? "col-4" : "col-9"}`}>Name</Col>
        {newCategory.fixed && <Col className="col-3">Amount</Col>}
        {newCategory.fixed && <Col className="col-3">Day</Col>}
        <Col className={`${newCategory.fixed ? "col-2" : "col-3"}`}>Delete</Col>
      </Row>
      <div>
        {newCategory.subcategories.map((subcategory, index) => (
          <Row key={index}>
            <Col className={`${newCategory.fixed ? "col-4" : "col-9"}`}>
              {subcategory.name}
            </Col>
            {newCategory.fixed && (
              <Col className="col-3">${subcategory.budget}</Col>
            )}
            {newCategory.fixed && (
              <Col className="col-3">{subcategory.dueDate}</Col>
            )}
            <Col className={`${newCategory.fixed ? "col-2" : "col-3"}`}>
              <i
                className="bi bi-trash delete"
                onClick={() => {
                  deleteSubcategory(subcategory);
                }}
              />
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};

export default AddedSubcategories;
