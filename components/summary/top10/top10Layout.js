import { Card, Col, Row } from "react-bootstrap";
import TopSpentStores from "./topSpentStores";
import TopStoresVisted from "./topStoresVisited";
import TopTransactions from "./topTransactions";
import TopSpendingMonths from "./topSpendingMonths";
import TopSpendingCategories from "./topSpendingCategories";
import TopOverSpendingCategories from "./topOverSpendingCategories";
import TopFixedCategories from "./topFixedCategories";
import LowestSpendingMonths from "./lowestSpendingMonths";
import TopOverspendingMonths from "./topOverspendingMonths";

const Top10Layout = ({ top10, months, categories }) => {
  return (
    <Row>
      {top10.map((section, index) => (
        <Col key={index} className="col-12 col-md-6 col-lg-4">
          <Card className="card-background mb-4 top-10-card">
            <Card.Body>
              <h4 className="text-center">{section.title}</h4>
              {section.title === "Top Spending Months" && (
                <TopSpendingMonths months={months} />
              )}
              {section.title === "Lowest Spending Months" && (
                <LowestSpendingMonths months={months} />
              )}
              {section.title === "Top Overspending Months" && (
                <TopOverspendingMonths months={months} />
              )}
              {section.title === "Top Changing Categories" && (
                <TopSpendingCategories categories={categories} />
              )}
              {section.title === "Top Fixed Categories" && (
                <TopFixedCategories categories={categories} />
              )}
              {section.title === "Overspending Categories" && (
                <TopOverSpendingCategories
                  categories={section.data.slice(0, 3)}
                />
              )}
              {section.title === "Stores Shopped" && (
                <TopSpentStores stores={section.data.slice(0, 3)} />
              )}
              {section.title === "Stores Visited" && (
                <TopStoresVisted stores={section.data.slice(0, 3)} />
              )}
              {section.title === "Transactions" && (
                <TopTransactions transactions={section.data.slice(0, 3)} />
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Top10Layout;
