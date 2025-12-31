import { Card, Col, Row } from "react-bootstrap";
import TopSpentStores from "./topSpentStores";
import TopStoresVisted from "./topStoresVisited";
import TopTransactions from "./topTransactions";
import TopSpendingMonths from "./topSpendingMonths";
import TopSpendingCategories from "./topSpendingCategories";
import TopOverSpendingCategories from "./topOverSpendingCategories";
import TopFixedCategories from "./topFixedCategories";

const Top10Layout = ({ top10 }) => {
  return (
    <Row>
      {top10.map((section, index) => (
        <Col key={index} className="col-12 col-md-6 col-lg-4">
          <Card className="card-background mb-4">
            <Card.Body>
              <h4 className="text-center">{section.title}</h4>
              {section.title === "Spending Months" && (
                <TopSpendingMonths months={section.data.slice(0, 3)} />
              )}
              {section.title === "Changing Categories" && (
                <TopSpendingCategories categories={section.data.slice(0, 3)} />
              )}
              {section.title === "Fixed Categories" && (
                <TopFixedCategories categories={section.data.slice(0, 3)} />
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
