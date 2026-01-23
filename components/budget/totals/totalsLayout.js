import PopUp from "@/components/layout/popUp";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import dollarFormatter from "@/helpers/dollarFormatter";
import { useContext } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

const cardColumn = "col-12 col-md-4 mb-2";

const TotalsLayout = () => {
  const { categoryTotals } = useContext(CategoriesContext);

  const remainingPercentage =
    (categoryTotals.actual / categoryTotals.budget) * 100;

  return (
    <Container className="mb-4">
      <Row className="text-center">
        <Col className={cardColumn}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <h4 className="fw-bold">
                Total Budget
                <PopUp
                  title="Your total income for the month."
                  id="budget-info"
                >
                  <span className="mx-1 fs-6"> &#9432;</span>
                </PopUp>
              </h4>
              <h5>{dollarFormatter(categoryTotals.budget)}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col className={cardColumn}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <h4 className="fw-bold">
                Total Spent
                <PopUp
                  title="The total amount spent between your fixed and changing expenses for the month."
                  id="spent-info"
                >
                  <span className="mx-1 fs-6"> &#9432;</span>
                </PopUp>
              </h4>
              <h5>{dollarFormatter(categoryTotals.actual)}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col className={cardColumn}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <h4 className="fw-bold">
                Total Left
                <PopUp
                  title="The total amount remaining for the month after all your expenses."
                  id="remaining-info"
                >
                  <span className="mx-1 fs-6"> &#9432;</span>
                </PopUp>
              </h4>
              <h5>
                <span
                  className={
                    remainingPercentage < 85
                      ? "text-success"
                      : remainingPercentage >= 85 && remainingPercentage < 100
                        ? "text-warning"
                        : "text-danger"
                  }
                >
                  {dollarFormatter(categoryTotals.remaining)}
                </span>
              </h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TotalsLayout;
