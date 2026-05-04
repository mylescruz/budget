import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Row } from "react-bootstrap";

const ExpenseDetails = ({ chosenTransaction }) => {
  return (
    <>
      <Row className="mx-1 my-3">
        Date: {dateFormatter(chosenTransaction.date)}
      </Row>
      <Row className="mx-1 my-3">Store: {chosenTransaction.store}</Row>
      {!chosenTransaction.isCategory && (
        <Row className="mx-1 my-3">
          Items Purchased: {chosenTransaction.items}
        </Row>
      )}
      <Row className="my-3">
        <div className="mx-1 d-flex flex-row">
          Category:{" "}
          <div className="d-flex flex-row align-items-center">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: chosenTransaction.color,
              }}
            />

            <div className="fw-semibold mx-2 my-0">
              {chosenTransaction.category}
            </div>
          </div>
        </div>
      </Row>
      <Row className="my-3">
        <div className="mx-1">
          Amount:{" "}
          <span
            className={
              chosenTransaction.amount < 0
                ? "fw-bold text-success"
                : "text-dark"
            }
          >
            {dollarFormatter(chosenTransaction.amount)}
          </span>
        </div>
      </Row>
    </>
  );
};

export default ExpenseDetails;
