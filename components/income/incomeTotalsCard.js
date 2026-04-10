import { Card, Col } from "react-bootstrap";

const IncomeTotalsCard = ({ total }) => {
  return (
    <Col className="col-12 col-md-6 col-xl-3">
      <Card className="my-2 text-center bg-dark p-3">
        <h5 className="text-white">{total.title}</h5>
        <h2 className="text-white">{total.amount}</h2>
      </Card>
    </Col>
  );
};

export default IncomeTotalsCard;
