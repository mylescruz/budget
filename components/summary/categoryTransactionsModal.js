import useYearTransactions from "@/hooks/useYearTransactions";
import { Modal } from "react-bootstrap";
import CategoryTransactionsTable from "./categoryTransactionsTable";
import LoadingIndicator from "../layout/loadingIndicator";

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

  if (transactionsLoading || !transactions) {
    return <LoadingIndicator />;
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
