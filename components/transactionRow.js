import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import TransactionDetails from "./transactionDetails";

const TransactionRow = ({ transaction }) => {
    const [showDetails, setDetails] = useState(false);

    let detailsModal = <TransactionDetails transaction={transaction} showDetails={showDetails} setDetails={setDetails}/>;

    const openDetails = () => {
        setDetails(true);
    };

    return (
        <>
            <tr onClick={openDetails}>
                <td>{dateFormatter(transaction.date)}</td>
                <td>{transaction.store}</td>
                <td>{transaction.category}</td>
                <td>{currencyFormatter.format(transaction.amount)}</td>
            </tr>

            {showDetails && <>{detailsModal}</>}
        </>
    );
};

export default TransactionRow;