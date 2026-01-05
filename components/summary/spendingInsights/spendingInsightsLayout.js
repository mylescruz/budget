import { Card, Col, Row } from "react-bootstrap";
import { useMemo } from "react";
import TopMonthsCard from "./topMonthsCard";
import TopCategoriesCard from "./topCategoriesCard";
import TopTransactionsCards from "./topTransactionsCard";

const SpendingInsightsLayout = ({ months, categories, transactions }) => {
  const insights = useMemo(
    () => [
      {
        title: "Top Spending Months",
        type: "months",
        value: "dollar",
        negative: false,
        months: [...months].sort((a, b) => b.actual - a.actual).slice(0, 3),
      },
      {
        title: "Lowest Spending Months",
        type: "months",
        value: "dollar",
        negative: false,
        months: [...months].sort((a, b) => a.actual - b.actual).slice(0, 3),
      },
      {
        title: "Top Overspending Months",
        type: "months",
        value: "dollar",
        negative: true,
        months: [...months]
          .filter((month) => month.remaining < 0)
          .sort((a, b) => a.remaining - b.remaining)
          .slice(0, 3),
      },
      {
        title: "Top Changing Categories",
        type: "categories",
        value: "dollar",
        negative: false,
        categories: [...categories]
          .filter((category) => !category.fixed)
          .sort((a, b) => b.actual - a.actual)
          .slice(0, 3),
      },
      {
        title: "Top Fixed Categories",
        type: "categories",
        value: "dollar",
        negative: false,
        categories: [...categories]
          .filter((category) => category.fixed)
          .sort((a, b) => b.actual - a.actual)
          .slice(0, 3),
      },
      {
        title: "Top Categories Overspent",
        type: "categories",
        value: "dollar",
        negative: true,
        categories: [...categories]
          .filter((category) => category.remaining < 0)
          .sort((a, b) => a.remaining - b.remaining)
          .slice(0, 3),
      },
    ],
    [months, categories]
  );

  return (
    <>
      <Row>
        <h3 className="text-center">Spending Insights</h3>
        {insights.map((insight, index) => (
          <Col key={index} className="col-12 col-md-6 col-lg-4">
            <Card className="card-background mb-4 top-10-card">
              {insight.type === "months" && <TopMonthsCard insight={insight} />}
              {insight.type === "categories" && (
                <TopCategoriesCard insight={insight} />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <TopTransactionsCards transactions={transactions} />
    </>
  );
};

export default SpendingInsightsLayout;
