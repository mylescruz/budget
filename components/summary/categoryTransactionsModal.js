import centsToDollars from "@/helpers/centsToDollars";
import dateFormatter from "@/helpers/dateFormatter";
import useYearTransactions from "@/hooks/useYearTransactions";
import { Col, Modal, Row } from "react-bootstrap";
import Loading from "../layout/loading";
import CategoryTransactionsTable from "./categoryTransactionsTable";

const CategoryTransactionsModal = ({
  year,
  category,
  showCategoryTransactions,
  closeTransactionsModal,
}) => {
  const { transactions, transactionsLoading } = useYearTransactions(
    year,
    category
  );

  if (transactionsLoading) {
    return <Loading />;
  } else {
    return (
      <Modal
        show={showCategoryTransactions}
        onHide={closeTransactionsModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{category} Transactions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">&#9432; Top 10 Most Expensive Transactions</p>
          <CategoryTransactionsTable transactions={transactions} />
        </Modal.Body>
      </Modal>
    );
  }
};

export default CategoryTransactionsModal;
