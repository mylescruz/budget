import currencyFormatter from "@/helpers/currencyFormatter";
import { useMemo } from "react";
import { Table } from "react-bootstrap";
import IncomeTableRow from "./incomeTableRow";
import PopUp from "../layout/popUp";

const IncomeTable = ({ income, putIncome, deleteIncome, yearInfo }) => {
  // Sets the table's total gross income, taxes and net income
  const footerValues = useMemo(() => {
    let totalGross = 0;
    let totalTaxes = 0;
    let totalNet = 0;

    income.forEach((paycheck) => {
      totalGross += paycheck.gross;
      totalTaxes += paycheck.taxes;
    });

    totalNet = totalGross - totalTaxes;

    return {
      totalGross: totalGross,
      totalTaxes: totalTaxes,
      totalNet: totalNet,
    };
  }, [income]);

  return (
    <Table striped hover>
      <thead className="table-dark">
        <tr className="d-flex">
          <th className="col-3 col-md-2 col-lg-1">Date</th>
          <th className="col-6 col-md-4 col-lg-3">
            Company
            <PopUp
              title="Click a paycheck to view its details."
              id="income-info"
            >
              <span> &#9432;</span>
            </PopUp>
          </th>
          <th className="d-none d-lg-block col-lg-2">Description</th>
          <th className="d-none d-md-block col-md-2 col-lg-2">Gross Pay</th>
          <th className="d-none d-md-block col-md-2 col-lg-2">Taxes</th>
          <th className="col-3 col-md-2 col-lg-2">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        {income.map((paycheck) => (
          <IncomeTableRow
            key={paycheck.id}
            paycheck={paycheck}
            putIncome={putIncome}
            deleteIncome={deleteIncome}
            yearInfo={yearInfo}
          />
        ))}
      </tbody>
      <tfoot>
        <tr className="d-flex">
          <th className="col-3 col-md-2">Total</th>
          <th className="col-6 col-md-4"></th>
          <th className="d-none d-md-block col-md-2">
            {currencyFormatter.format(footerValues.totalGross)}
          </th>
          <th className="d-none d-md-block col-md-2">
            {currencyFormatter.format(footerValues.totalTaxes)}
          </th>
          <th className="col-3 col-md-2">
            {currencyFormatter.format(footerValues.totalNet)}
          </th>
        </tr>
      </tfoot>
    </Table>
  );
};

export default IncomeTable;
