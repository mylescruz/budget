import dollarFormatter from "@/helpers/dollarFormatter";
import { Modal, Table } from "react-bootstrap";

const MonthsSpendingModal = ({ months, modal, setModal }) => {
  const spendingTotals = months.reduce(
    (sum, current) => sum + current.actual,
    0
  );

  const closeMonthsModal = () => {
    setModal("none");
  };

  return (
    <Modal show={modal === "spent"} onHide={closeMonthsModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Spending Breakdown</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped>
          <thead className="table-dark">
            <tr className="d-flex">
              <th className="col-6">Month</th>
              <th className="col-6 text-end">Spent</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index} className="d-flex">
                <td className="col-6 fw-bold">{month.name}</td>
                <td className="col-6 text-end">
                  {dollarFormatter(month.actual)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr className="d-flex">
              <th className="col-6">Total</th>
              <th className="col-6 text-end">
                {dollarFormatter(spendingTotals)}
              </th>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default MonthsSpendingModal;
