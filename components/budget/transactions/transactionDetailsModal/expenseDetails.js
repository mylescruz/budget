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
      <Row className="mx-1 my-3">Category: {chosenTransaction.category}</Row>
      <Row className="mx-1 my-3">
        Amount: {dollarFormatter(chosenTransaction.amount)}
      </Row>
    </>
  );
};

export default ExpenseDetails;
