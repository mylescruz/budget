import PopUp from "@/components/layout/popUp";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Card } from "react-bootstrap";

const TotalsCard = ({ title, amount, amountTextColor, description }) => {
  return (
    <Card className="bg-dark text-center">
      <Card.Body className="text-white">
        <h4 className="fw-bold">
          {title}
          <PopUp title={description}>
            <span className="fs-5"> &#9432;</span>
          </PopUp>
        </h4>
        <h5 className={`${amountTextColor} fw-bold`}>
          {dollarFormatter(amount)}
        </h5>
      </Card.Body>
    </Card>
  );
};

export default TotalsCard;
