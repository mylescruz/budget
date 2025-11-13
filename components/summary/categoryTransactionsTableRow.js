import centsToDollars from "@/helpers/centsToDollars";
import dateFormatter from "@/helpers/dateFormatter";

const CategoryTransactionsTableRow = ({ transaction }) => {
  return (
    <tr className="d-flex">
      <td className="col-3">{dateFormatter(transaction.date)}</td>
      <td className="col-6">
        <span className="d-sm-none">
          {transaction.store.length > 15
            ? transaction.store.slice(0, 15) + "..."
            : transaction.store}
        </span>
        <span className="d-none d-sm-block d-md-none">
          {transaction.store.length > 25
            ? transaction.store.slice(0, 25) + "..."
            : transaction.store}
        </span>
        <span className="d-none d-md-block d-lg-none">
          {transaction.store.length > 30
            ? transaction.store.slice(0, 30) + "..."
            : transaction.store}
        </span>
        <span className="d-none d-lg-block d-xl-none">
          {transaction.store.length > 35
            ? transaction.store.slice(0, 35) + "..."
            : transaction.store}
        </span>
        <span className="d-none d-xl-block">
          {transaction.store.length > 40
            ? transaction.store.slice(0, 40) + "..."
            : transaction.store}
        </span>
      </td>
      <td className={`col-3 ${transaction.amount < 0 && "text-danger"}`}>
        {centsToDollars(transaction.amount)}
      </td>
    </tr>
  );
};

export default CategoryTransactionsTableRow;
