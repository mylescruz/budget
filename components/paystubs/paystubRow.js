import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import PaystubDetails from "./paystubDetails";
import styles from "@/styles/paystubRow.module.css";

const PaystubRow = ({ paystub }) => {
    const [showDetails, setShowDetails] = useState(false);

    const openDetails = () => {
        setShowDetails(true);
    };

    const paystubDetailsProps = { 
        paystub: paystub,
        showDetails: showDetails,
        setShowDetails: setShowDetails
    };

    return (
        <>
            <tr className={styles.cell} onClick={openDetails}>
                <td>{dateFormatter(paystub.date)}</td>
                <td>{paystub.company}</td>
                <td>{currencyFormatter.format(paystub.gross)}</td>
                <td>{currencyFormatter.format(paystub.taxes)}</td>
                <td>{currencyFormatter.format(paystub.net)}</td>
            </tr>

            { showDetails && <PaystubDetails {...paystubDetailsProps} />}
        </>
    );
};

export default PaystubRow;