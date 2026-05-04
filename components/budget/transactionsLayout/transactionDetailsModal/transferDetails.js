import dateFormatter from "@/helpers/dateFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Row } from "react-bootstrap";

const TransferDetails = ({ chosenTransaction }) => {
  return (
    <>
      <Row className="mx-1 my-3">
        Date: {dateFormatter(chosenTransaction.date)}
      </Row>
      <Row className="mx-1 my-3">
        Transfer From: {chosenTransaction.fromAccount}
      </Row>
      <Row className="mx-1 my-3">
        Transfer To: {chosenTransaction.toAccount}
      </Row>
      <Row className="mx-1 my-3">
        Description: {chosenTransaction.description}
      </Row>
      <Row className="mx-1 my-3">
        Amount: {dollarFormatter(chosenTransaction.amount)}
      </Row>
    </>
  );
};

export default TransferDetails;
