import { Button, Col, Row } from "react-bootstrap";

const ConfirmationPage = ({ newCategory }) => {
  return (
    <div className="mb-2">
      <h5>Confirm the category information</h5>
      <p className="my-1">
        <span className="fw-bold">Name:</span> {newCategory.name}
      </p>
      <p className="my-1">
        <span className="fw-bold">Budget:</span> ${newCategory.budget}
      </p>
      <p className="my-1">
        <span className="fw-bold">Color:</span>{" "}
        <Button
          style={{
            backgroundColor: newCategory.color,
            border: newCategory.color,
          }}
        ></Button>
      </p>
      <p className="my-1">
        <span className="fw-bold">Fixed:</span>{" "}
        {newCategory.fixed ? "Yes" : "No"}
      </p>
      {newCategory.fixed && !newCategory.hasSubcategory && (
        <div>
          <p className="my-1">
            <span className="fw-bold">Frequency:</span> {newCategory.frequency}
          </p>
          <p className="my-1">
            <span className="fw-bold">Day of the month:</span>{" "}
            {newCategory.dueDate}
          </p>
        </div>
      )}
      {newCategory.subcategories.length > 0 && (
        <div>
          <p className="fw-bold my-0">Subcategories:</p>
          <Row className="fw-bold">
            <Col className={`${newCategory.fixed ? "col-6" : "col-12"}`}>
              Name
            </Col>
            {newCategory.fixed && <Col className="col-3">Amount</Col>}
            {newCategory.fixed && <Col className="col-3">Day</Col>}
          </Row>
          <div>
            {newCategory.subcategories.map((subcategory) => (
              <Row key={subcategory.id}>
                <Col className={`${newCategory.fixed ? "col-6" : "col-12"}`}>
                  {subcategory.name}
                </Col>
                {newCategory.fixed && (
                  <Col className="col-3">${subcategory.actual}</Col>
                )}
                {newCategory.fixed && (
                  <Col className="col-3">{subcategory.dueDate}</Col>
                )}
              </Row>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationPage;
