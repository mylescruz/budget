import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import PaystubDetails from "./paystubDetails";
import EditPaystub from "./editPaystub";
import DeletePaystub from "./deletePaystub";

const PaystubRow = ({ paystub, putPaystub, deletePaystub, yearInfo }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const openDetails = () => {
        setShowDetails(true);
    };

    const paystubDetailsProps = { 
        paystub: paystub,
        showDetails: showDetails,
        setShowDetails: setShowDetails,
        setShowEdit: setShowEdit,
        setShowDelete: setShowDelete
    };

    const editPaystubProps = {
        paystub: paystub,
        putPaystub: putPaystub,
        yearInfo: yearInfo,
        showEdit: showEdit,
        setShowEdit: setShowEdit,
        setShowDetails: setShowDetails
    };

    const deletePaystubProps = {
        paystub: paystub,
        deletePaystub: deletePaystub,
        showDelete: showDelete,
        setShowDelete: setShowDelete,
        setShowDetails: setShowDetails
    };

    return (
        <>
            <tr className={`d-flex click`} onClick={openDetails}>
                <td className="col-3 col-md-2">{dateFormatter(paystub.date)}</td>
                <td className="col-6 col-md-4 cell">{paystub.company}</td>
                <td className="d-none d-md-block col-md-2">{currencyFormatter.format(paystub.gross)}</td>
                <td className="d-none d-md-block col-md-2">{currencyFormatter.format(paystub.taxes)}</td>
                <td className="col-3 col-md-2">{currencyFormatter.format(paystub.net)}</td>
            </tr>

            { showDetails && <PaystubDetails {...paystubDetailsProps} />}
            { showEdit && <EditPaystub {...editPaystubProps} /> }
            { showDelete && <DeletePaystub {...deletePaystubProps} /> }
        </>
    );
};

export default PaystubRow;