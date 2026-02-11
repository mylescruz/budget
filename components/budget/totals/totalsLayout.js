import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import TotalsCard from "./totalsCard";

const TotalsLayout = () => {
  const { categoryTotals } = useContext(CategoriesContext);

  const totals = [
    {
      title: "Total Budget",
      amount: categoryTotals.budget,
      description: "Your total income for the month.",
    },
    {
      title: "Total Spent",
      amount: categoryTotals.actual,
      description:
        "The total amount spent between your fixed and changing expenses for the month.",
    },
    {
      title: "Total Left",
      amount: categoryTotals.remaining,
      description:
        "The total amount remaining for the month after all your expenses.",
    },
  ];

  return (
    <Container className="mb-4">
      <Row className="text-center">
        {totals.map((total) => (
          <Col key={total.title} className="col-12 col-md-4 mb-2">
            <TotalsCard
              title={total.title}
              amount={total.amount}
              description={total.description}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TotalsLayout;
