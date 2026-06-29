import useDebts from "@/hooks/useDebts";
import { Col, Container, Row } from "react-bootstrap";
import LoadingIndicator from "../ui/loadingIndicator";
import ErrorMessage from "../ui/errorMessage";
import DebtHeader from "./debtHeader";
import DebtSummary from "./debtSummary";
import { useMemo, useState } from "react";
import AddDebtModal from "./addDebtModal/addDebtModal";
import DebtCard from "./debtCard";
import DeleteDebtModal from "./mutateDebt/deleteDebtModal";
import SuccessMessage from "../ui/successMessage";

const DebtLayout = () => {
  const { debts, reqStatus, postDebt, deleteDebt } = useDebts();

  const [selectedDebt, setSelectedDebt] = useState(null);
  const [modal, setModal] = useState(null);

  const displayedModal = useMemo(() => {
    switch (modal) {
      case "ADD":
        return (
          <AddDebtModal modal={modal} setModal={setModal} postDebt={postDebt} />
        );
      case "DELETE":
        return (
          <DeleteDebtModal
            debt={selectedDebt}
            deleteDebt={deleteDebt}
            reqStatus={reqStatus}
            modal={modal}
            setModal={setModal}
          />
        );
      default:
        return null;
    }
  }, [modal]);

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
                <>
                  <DebtSummary debts={debts} />

                  <Row className="g-3">
                    {debts.map((debt) => (
                      <Col key={debt._id} xs={12} lg={6}>
                        <DebtCard
                          debt={debt}
                          setSelectedDebt={setSelectedDebt}
                          setModal={setModal}
                        />
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Container>

        <SuccessMessage
          show={reqStatus.isSuccess}
          message={reqStatus.message}
        />

        {displayedModal}
      </>
    );
  }
};

export default DebtLayout;
