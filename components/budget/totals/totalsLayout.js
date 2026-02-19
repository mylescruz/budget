import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import TotalsCard from "./totalsCard";

const SAFE_LIMIT = Math.round((10 / 12) * 100);
const MAX_VALUE = 100;

const TotalsLayout = () => {
  const { categoryTotals } = useContext(CategoriesContext);

  // Define the text color of the amount values for the cards
  const nonFixedSpendingPercentage = Math.round(
    (categoryTotals.nonFixedActual / categoryTotals.nonFixedBudget) * 100,
  );

  let nonFixedRemainingColor;

  console.log(nonFixedSpendingPercentage);

  // Show red text if the user has no income or if their available spending balance is less than 0
  if (categoryTotals.budget === 0 || categoryTotals.nonFixedRemaining < 0) {
    nonFixedRemainingColor = "text-danger";
  } else if (
    nonFixedSpendingPercentage < MAX_VALUE &&
    nonFixedSpendingPercentage > SAFE_LIMIT
  ) {
    nonFixedRemainingColor = "text-warning";
  } else {
    nonFixedRemainingColor = "text-success";
  }

  const totals = [
    {
      title: "Total Budget",
      amount: categoryTotals.budget,
      amountTextColor:
        categoryTotals.budget === 0 ? "text-danger" : "text-white",
      description: "Your total income for the month.",
    },
    {
      title: "Left to Spend",
      amount: categoryTotals.nonFixedRemaining,
      amountTextColor: nonFixedRemainingColor,
      description:
        "The amount remaining to spend after all your fixed expenses for the month are covered.",
    },
  ];

  return (
    <Container className="mb-4">
      <Row className="text-center d-flex justify-content-evenly mx-auto">
        {totals.map((total) => (
          <Col key={total.title} className="col-12 col-md-5 mb-2">
            <TotalsCard
              title={total.title}
              amount={total.amount}
              amountTextColor={total.amountTextColor}
              description={total.description}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TotalsLayout;
