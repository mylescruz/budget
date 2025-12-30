import { useState } from "react";
import { Card, Form } from "react-bootstrap";
import TopSpentStores from "./topSpentStores";
import TopStoresVisted from "./topStoresVisited";
import TopTransactions from "./topTransactions";

const Top10Layout = ({ top10 }) => {
  const topItems = ["Stores Shopped", "Stores Visited", "Transactions"];

  const [topSelected, setTopSelected] = useState(topItems[0]);

  const handleInput = (e) => {
    setTopSelected(e.target.value);
  };

  return (
    <>
      <h3 className="text-center">Top 10</h3>
      <Form.Group className="my-2">
        <Form.Select
          id="type"
          className="h-100"
          value={topSelected}
          onChange={handleInput}
          required
        >
          {topItems.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Card className="card-background">
        {topSelected === "Stores Shopped" && (
          <TopSpentStores stores={top10.storesSpent} />
        )}
        {topSelected === "Stores Visited" && (
          <TopStoresVisted stores={top10.storesVisited} />
        )}
        {topSelected === "Transactions" && (
          <TopTransactions transactions={top10.transactions} />
        )}
      </Card>
    </>
  );
};

export default Top10Layout;
