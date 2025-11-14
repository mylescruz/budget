import { Table } from "react-bootstrap";
import CategoryTransactionsTableRow from "./categoryTransactionsTableRow";

const CategoryTransactionsTable = ({ transactions }) => {
  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2">Date</th>
          <th className="col-6 col-md-4">Store</th>
          <th className="d-none d-md-block col-md-4">Items</th>
          <th className="col-3 col-md-2">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <CategoryTransactionsTableRow
            key={transaction._id}
            transaction={transaction}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default CategoryTransactionsTable;
