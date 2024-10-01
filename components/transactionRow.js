import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";

const TransactionRow = ({ transaction }) => {

    return (
        <tr>
            <td>{dateFormatter(transaction.date)}</td>
            <td>{transaction.store}</td>
            <td>{transaction.items}</td>
            <td>{transaction.category}</td>
            <td>{currencyFormatter.format(transaction.amount)}</td>
        </tr>
    );
};

export default TransactionRow;