import dayFormatter from "@/helpers/dayFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Button, Col, Row } from "react-bootstrap";

const titleStyle = "fw-bold fs-5";

const CategoryConfirmationPage = ({ newCategory }) => {
  return (
    <div>
      <h5 className="text-center mb-2">Confirm the category information</h5>
      <p className="my-1">
        <span className={titleStyle}>Name:</span> {newCategory.name}
      </p>
      <p className="my-1">
        <span className={titleStyle}>Budget:</span>{" "}
        {dollarFormatter(newCategory.budget)}
      </p>
      <p className="my-1">
        <span className={titleStyle}>Color:</span>{" "}
        <Button
          style={{
            backgroundColor: newCategory.color,
            border: newCategory.color,
          }}
        />
      </p>
      <p className="my-1">
        <span className={titleStyle}>Fixed:</span>{" "}
        {newCategory.fixed ? "Yes" : "No"}
      </p>
      {newCategory.fixed && !newCategory.hasSubcategory && (
        <div>
          <p className="my-1">
            <span className={titleStyle}>Frequency:</span>{" "}
            {newCategory.frequency}
          </p>
          <p className="my-1">
            <span className={titleStyle}>Due on the:</span>{" "}
            {dayFormatter(newCategory.dueDate)}
          </p>
        </div>
      )}
      {newCategory.subcategories.length > 0 && (
        <div>
          <p className={`${titleStyle} my-0`}>Subcategories</p>
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
                  <Col className="col-3">
                    {dollarFormatter(subcategory.actual)}
                  </Col>
                )}
                {newCategory.fixed && (
                  <Col className="col-3">
                    {dayFormatter(subcategory.dueDate)}
                  </Col>
                )}
              </Row>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryConfirmationPage;
