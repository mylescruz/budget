import centsToDollars from "@/helpers/centsToDollars";
import dateFormatter from "@/helpers/dateFormatter";

const CategoryTransactionsTableRow = ({ transaction }) => {
  return (
    <tr className="d-flex">
      <td className="col-3 col-md-2">{dateFormatter(transaction.date)}</td>
      <td className="col-6 col-md-4">
        {transaction.store.length > 15
          ? transaction.store.slice(0, 15) + "..."
          : transaction.store}
      </td>
      <td className="d-none d-md-block col-md-4">
        <span className="d-none d-md-block">
          {transaction.items.length > 12
            ? transaction.items.slice(0, 12) + "..."
            : transaction.items}
        </span>
      </td>
      <td
        className={`col-3 col-md-2 ${transaction.amount < 0 && "text-danger"}`}
      >
        {centsToDollars(transaction.amount)}
      </td>
    </tr>
  );
};

export default CategoryTransactionsTableRow;
