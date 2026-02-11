import PopUp from "@/components/layout/popUp";
import dollarFormatter from "@/helpers/dollarFormatter";
import { Card } from "react-bootstrap";

const TotalsCard = ({ title, amount, description }) => {
  return (
    <Card className="bg-dark text-white">
      <Card.Body>
        <h4 className="fw-bold">
          {title}
          <PopUp title={description}>
            <span className="fs-5"> &#9432;</span>
          </PopUp>
        </h4>
        <h5>{dollarFormatter(amount)}</h5>
      </Card.Body>
    </Card>
  );
};

export default TotalsCard;
