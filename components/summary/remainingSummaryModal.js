import dollarFormatter from "@/helpers/dollarFormatter";
import { Modal, Table } from "react-bootstrap";

const RemainingSummaryModal = ({ months, totalRemaining, modal, setModal }) => {
  const closeMonthsModal = () => {
    setModal("none");
  };

  return (
    <Modal show={modal === "remaining"} onHide={closeMonthsModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Remaining Breakdown</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped>
          <thead className="table-dark">
            <tr className="d-flex">
              <th className="col-6">Month</th>
              <th className="col-6 text-end">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, index) => (
              <tr key={index} className="d-flex">
                <td className="col-6 fw-bold">{month.name}</td>
                <td className="col-6 text-end">
                  <span
                    className={
                      month.remaining < 0
                        ? "fw-bold text-danger"
                        : "fw-bold text-success"
                    }
                  >
                    {dollarFormatter(month.remaining)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr className="d-flex">
              <th className="col-6">Total</th>
              <th className="col-6 text-end">
                <span
                  className={
                    totalRemaining < 0
                      ? "fw-bold text-danger"
                      : "fw-bold text-success"
                  }
                >
                  {dollarFormatter(totalRemaining)}
                </span>
              </th>
            </tr>
          </tfoot>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default RemainingSummaryModal;
