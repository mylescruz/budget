import { Table } from "react-bootstrap";
import CategoryTransactionsTableRow from "./categoryTransactionsTableRow";

const CategoryTransactionsTable = ({ transactions }) => {
  return (
    <Table striped>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3">Date</th>
          <th className="col-6">Store</th>
          <th className="col-3">Amount</th>
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
