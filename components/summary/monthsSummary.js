import dollarFormatter from "@/helpers/dollarFormatter";
import { Card, Col, Container, Row } from "react-bootstrap";

const MonthsSummary = ({ months }) => {
  const monthsArray = [
    {
      title: "Highest",
      name: months.max.monthName,
      amount: months.max.amount,
    },
    {
      title: "Lowest",
      name: months.min.monthName,
      amount: months.min.amount,
    },
    {
      title: "Average",
      name: "Per Month",
      amount: months.avg,
    },
  ];

  return (
    <Container>
      <Row className="d-flex align-items-start">
        {monthsArray.map((month, index) => (
          <Col key={index} className="col-12 col-md-4">
            <Card className="my-2 card-background">
              <Card.Body>
                <h4 className="fw-bold">{month.title}</h4>
                <h5>{month.name}</h5>
                <h5>{dollarFormatter(month.amount)}</h5>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MonthsSummary;
