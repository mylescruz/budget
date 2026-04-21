import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import dollarsToCents from "@/helpers/dollarsToCents";
import { INCOME_TYPES } from "@/lib/constants/income";
import { Modal, Table } from "react-bootstrap";

const IncomeSummaryModal = ({ income, modal, setModal }) => {
  const totals = income.reduce(
    (sum, type) => {
      sum.amount += dollarsToCents(type.amount);

      if (type.name === INCOME_TYPES.PAYCHECK) {
        sum.gross += dollarsToCents(type.gross);
        sum.deductions += dollarsToCents(type.deductions);
      }

      return sum;
    },
    {
      gross: 0,
      deductions: 0,
      amount: 0,
    },
  );

  const incomeTotals = {
    gross: centsToDollars(totals.gross),
    deductions: centsToDollars(totals.deductions),
    amount: centsToDollars(totals.amount),
  };

  const closeIncomeModal = () => {
    setModal("none");
  };

  return (
    <Modal show={modal === "income"} onHide={closeIncomeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Income Breakdown</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped>
          <thead className="table-dark">
            <tr className="d-flex">
              <th className="col-6 col-md-3">Type</th>
              <th className="d-none d-md-block col-md-3 text-end">Gross</th>
              <th className="d-none d-md-block col-md-3 text-end">
                Deductions
              </th>
              <th className="col-6 col-md-3 text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {income.map((type, index) => (
              <tr key={index} className="d-flex">
                <td className="col-6 col-md-3 fw-bold">{type.name}</td>
                <td className="d-none d-md-block col-md-3 text-end">
                  {type.gross && dollarFormatter(type.gross)}
                </td>
                <td className="d-none d-md-block col-md-3 text-end">
                  {type.deductions && dollarFormatter(type.deductions)}
                </td>
                <td className="col-6 col-md-3 text-end">
                  {dollarFormatter(type.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr className="d-flex">
              <th className="col-6 col-md-3">Total</th>
              <th className="d-none d-md-block col-md-3 text-end">
                {dollarFormatter(incomeTotals.gross)}
              </th>
              <th className="d-none d-md-block col-md-3 text-end">
                {dollarFormatter(incomeTotals.deductions)}
              </th>
              <th className="col-6 col-md-3 text-end">
                {dollarFormatter(incomeTotals.amount)}
              </th>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default IncomeSummaryModal;
