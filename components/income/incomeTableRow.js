import currencyFormatter from "@/helpers/currencyFormatter";
import dateFormatter from "@/helpers/dateFormatter";
import { useState } from "react";
import IncomeDetailsModal from "./incomeDetailsModal";
import EditIncomeModal from "./editIncomeModal";
import DeleteIncomeModal from "./deleteIncomeModal";

const IncomeTableRow = ({
  paycheck,
  putIncome,
  deleteIncome,
  yearInfo,
  getMonthIncome,
}) => {
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
    setShowDelete: setShowDelete,
  };

  const editIncomeModalProps = {
    paycheck: paycheck,
    putIncome: putIncome,
    yearInfo: yearInfo,
    showEdit: showEdit,
    setShowEdit: setShowEdit,
    setShowDetails: setShowDetails,
    getMonthIncome: getMonthIncome,
  };

  const deleteIncomeModalProps = {
    paycheck: paycheck,
    deleteIncome: deleteIncome,
    showDelete: showDelete,
    setShowDelete: setShowDelete,
    setShowDetails: setShowDetails,
    getMonthIncome: getMonthIncome,
  };

  return (
    <>
      <tr className="d-flex click" onClick={openDetails}>
        <td className="col-3 col-md-2 col-lg-1">
          {dateFormatter(paycheck.date)}
        </td>
        <td className="col-6 col-md-4 col-lg-3">
          <>
            <span className="d-sm-none">
              {paycheck.company.length > 15
                ? paycheck.company.slice(0, 15) + "..."
                : paycheck.company}
            </span>
            <span className="d-none d-sm-block d-md-none">
              {paycheck.company.length > 25
                ? paycheck.company.slice(0, 25) + "..."
                : paycheck.company}
            </span>
            <span className="d-none d-md-block">
              {paycheck.company.length > 30
                ? paycheck.company.slice(0, 30) + "..."
                : paycheck.company}
            </span>
          </>
        </td>
        <td className="d-none d-lg-block col-lg-2">
          {paycheck.description.length > 10 ? (
            <span>{paycheck.description.slice(0, 10)}...</span>
          ) : (
            <span>{paycheck.description}</span>
          )}
        </td>
        <td className="d-none d-md-block col-md-2 col-lg-2">
          {currencyFormatter.format(paycheck.gross)}
        </td>
        <td className="d-none d-md-block col-md-2 col-lg-2">
          {currencyFormatter.format(paycheck.taxes)}
        </td>
        <td className="col-3 col-md-2 col-lg-2">
          {currencyFormatter.format(paycheck.net)}
        </td>
      </tr>

      {showDetails && <IncomeDetailsModal {...incomeDetailsProps} />}
      {showEdit && <EditIncomeModal {...editIncomeModalProps} />}
      {showDelete && <DeleteIncomeModal {...deleteIncomeModalProps} />}
    </>
  );
};

export default IncomeTableRow;
