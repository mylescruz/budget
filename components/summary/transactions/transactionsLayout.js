import { useState } from "react";
import TransactionModal from "./transactionModal";
import TransactionsTable from "./transactionsTable";
import { Card } from "react-bootstrap";

const TransactionsLayout = ({ transactions }) => {
  const [chosenTransaction, setChosenTransaction] = useState(null);
  const [modal, setModal] = useState(null);

  return (
    <div className="my-4">
      <h5 className="fw-bold">Transactions</h5>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <TransactionsTable
            transactions={transactions}
            setChosenTransaction={setChosenTransaction}
            setModal={setModal}
          />
        </Card.Body>
      </Card>

      {modal === "DETAILS" && (
        <TransactionModal
          chosenTransaction={chosenTransaction}
          modal={modal}
          setModal={setModal}
        />
      )}
    </div>
  );
};

export default TransactionsLayout;
