import currencyFormatter from "@/helpers/currencyFormatter";

const TransactionRow = ({ transaction }) => {

    return (
        <tr>
            <td>{transaction.date}</td>
            <td>{transaction.store}</td>
            <td>{transaction.items}</td>
            <td>{transaction.category}</td>
            <td>{currencyFormatter.format(transaction.amount)}</td>
        </tr>
    );
};

export default TransactionRow;