import useDebts from "@/hooks/useDebts";
import { Col, Container, Row } from "react-bootstrap";
import LoadingIndicator from "../ui/loadingIndicator";
import ErrorMessage from "../ui/errorMessage";
import DebtHeader from "./debtHeader";
import DebtSummary from "./debtSummary";
import { useState } from "react";
import AddDebtModal from "./addDebtModal/addDebtModal";

const DebtLayout = () => {
  const { debts, reqStatus, postDebt } = useDebts();

  const [modal, setModal] = useState(null);

  let displayedModal;

  switch (modal) {
    case "ADD":
      displayedModal = (
        <AddDebtModal modal={modal} setModal={setModal} postDebt={postDebt} />
      );
      break;
    default:
      displayedModal = null;
  }

  if (reqStatus.isInitialLoad) {
    return <LoadingIndicator message={reqStatus.message} />;
  } else {
    return (
      <>
        <Container>
          <Row className="d-flex justify-content-center">
            <Col xs={12} xl={10}>
              <DebtHeader setModal={setModal} />

              {reqStatus.isInitialError ? (
                <ErrorMessage message={reqStatus.message} />
              ) : (
                <DebtSummary debts={debts} />
              )}
            </Col>
          </Row>
        </Container>

        {displayedModal}
      </>
    );
  }
};

export default DebtLayout;
