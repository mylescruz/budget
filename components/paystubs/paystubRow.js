import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import PaystubDetails from "./paystubDetails";
import styles from "@/styles/paystubRow.module.css";
import EditPaystub from "./editPaystub";

const PaystubRow = ({ paystub, editOldPaystub }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const openDetails = () => {
        setShowDetails(true);
    };

    const paystubDetailsProps = { 
        paystub: paystub,
        showDetails: showDetails,
        setShowDetails: setShowDetails,
        showEdit: showEdit,
        setShowEdit: setShowEdit
    };

    const editPaystubProps = {
        paystub: paystub,
        editOldPaystub: editOldPaystub,
        showEdit: showEdit,
        setShowEdit: setShowEdit,
        setShowDetails: setShowDetails
    }

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
            { showEdit && <EditPaystub {...editPaystubProps} /> }
        </>
    );
};

export default PaystubRow;