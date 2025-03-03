import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import IncomeDetails from "./incomeDetails";
import EditIncome from "./editIncome";
import DeleteIncome from "./deleteIncome";

const IncomeRow = ({ paycheck, putIncome, deleteIncome, yearInfo }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const openDetails = () => {
        setShowDetails(true);
    };

    const incomeDetailsProps = { 
        paycheck: paycheck,
        showDetails: showDetails,
        setShowDetails: setShowDetails,
        setShowEdit: setShowEdit,
        setShowDelete: setShowDelete
    };

    const editIncomeProps = {
        paycheck: paycheck,
        putIncome: putIncome,
        yearInfo: yearInfo,
        showEdit: showEdit,
        setShowEdit: setShowEdit,
        setShowDetails: setShowDetails
    };

    const deleteIncomeProps = {
        paycheck: paycheck,
        deleteIncome: deleteIncome,
        showDelete: showDelete,
        setShowDelete: setShowDelete,
        setShowDetails: setShowDetails
    };

    return (
        <>
            <tr className={`d-flex click`} onClick={openDetails}>
                <td className="col-3 col-md-2">{dateFormatter(paycheck.date)}</td>
                <td className="col-6 col-md-4 cell">{paycheck.company}</td>
                <td className="d-none d-md-block col-md-2">{currencyFormatter.format(paycheck.gross)}</td>
                <td className="d-none d-md-block col-md-2">{currencyFormatter.format(paycheck.taxes)}</td>
                <td className="col-3 col-md-2">{currencyFormatter.format(paycheck.net)}</td>
            </tr>

            { showDetails && <IncomeDetails {...incomeDetailsProps} />}
            { showEdit && <EditIncome {...editIncomeProps} /> }
            { showDelete && <DeleteIncome {...deleteIncomeProps} /> }
        </>
    );
};

export default IncomeRow;