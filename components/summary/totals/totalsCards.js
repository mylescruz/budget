import dollarFormatter from "@/helpers/dollarFormatter";
import { Col } from "react-bootstrap";

const TotalsCards = ({ total, chooseTopic }) => {
  return (
    <Col xs={12} md={4}>
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 text-center">
        <h6 className="text-muted">{total.title}</h6>
        <h4 className={`fw-bold ${total.textColor}`}>
          {dollarFormatter(total.amount)}
        </h4>
        <p
          className="text-muted small clicker m-0"
          onClick={() => {
            chooseTopic(total.title);
          }}
        >
          Per Month Breakdown <i className="bi bi-arrow-right small" />
        </p>
      </div>
    </Col>
  );
};

export default TotalsCards;
