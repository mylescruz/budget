import centsToDollars from "@/helpers/centsToDollars";
import dollarFormatter from "@/helpers/dollarFormatter";
import dollarsToCents from "@/helpers/dollarsToCents";
import { INCOME_TYPES } from "@/lib/constants/income";
import { Modal, Table } from "react-bootstrap";

const IncomeSummaryModal = ({ months, totalIncome, modal, setModal }) => {
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
              <th className="col-6">Month</th>
              <th className="col-6 text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index} className="d-flex">
                <td className="col-6 fw-bold">{month.name}</td>
                <td className="col-6 text-end">
                  {dollarFormatter(month.income)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr className="d-flex">
              <th className="col-6">Total</th>
              <th className="col-6 text-end">{dollarFormatter(totalIncome)}</th>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default IncomeSummaryModal;
