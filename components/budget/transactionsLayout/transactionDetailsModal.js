import { Button, Modal } from "react-bootstrap";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";
import dollarFormatter from "@/helpers/dollarFormatter";

const TransactionDetailsModal = ({ chosenTransaction, modal, setModal }) => {
  const closeDetailsModal = () => {
    setModal(null);
  };

  // Flag to give the user the option to delete an expense transaction if its not fixed or delete a transfer
  const isAbleToDelete =
    (chosenTransaction.type === TRANSACTION_TYPES.EXPENSE &&
      !chosenTransaction.fixed) ||
    chosenTransaction.type === TRANSACTION_TYPES.TRANSFER;

  const transaction = {
    date: new Date(chosenTransaction.date).toDateString(),
    type: chosenTransaction.type,
    amount: chosenTransaction.amount,
  };

  switch (transaction.type) {
    case TRANSACTION_TYPES.EXPENSE:
      transaction.name = chosenTransaction.store;
      transaction.category = (
        <div className="d-flex flex-row align-items-center">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: chosenTransaction.color,
            }}
          />
          <p className="mx-2 my-0 p-0">{chosenTransaction.category}</p>
        </div>
      );
      transaction.description = chosenTransaction.items;
      break;
    case TRANSACTION_TYPES.TRANSFER:
      transaction.name = `Transfer from ${chosenTransaction.fromAccount} to ${chosenTransaction.toAccount}`;
      transaction.category = <p>🔄 Transfer</p>;
      transaction.description = chosenTransaction.description;
      break;
  }

  return (
    <Modal show={modal === "DETAILS"} onHide={closeDetailsModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{`${transaction.type} Details`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Amount */}
        <div className="text-center mb-4">
          <h3
            className={`fw-bold ${
              transaction.amount < 0 ? "text-success" : "text-dark"
            }`}
          >
            {dollarFormatter(transaction.amount)}
          </h3>

          <p className="text-muted small mb-0">{transaction.date}</p>
        </div>

        {/* Details */}
        <div className="d-flex flex-column gap-3">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Merchant</span>
            <span className="fw-medium text-end ms-3">{transaction.name}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Category</span>

            <div className="d-flex align-items-center gap-2">
              {transaction.category}
            </div>
          </div>

          <div>
            <p className="text-muted mb-1">Description</p>

            <p className="mb-0 small">{transaction.description}</p>
          </div>
        </div>
      </Modal.Body>
      {isAbleToDelete && (
        <Modal.Footer className="d-flex flex-row justify-content-between">
          <Button variant="danger" onClick={() => setModal("DELETE")}>
            Delete
          </Button>
          <Button variant="info" onClick={() => setModal("EDIT")}>
            Edit
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default TransactionDetailsModal;
