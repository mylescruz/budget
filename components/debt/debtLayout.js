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
import EditDebtModal from "./mutateDebt/editDebtModal";
import PaidOffDebtModal from "./mutateDebt/paidOffDebtModal";
import InactiveDebtLayout from "./inactiveDebt/inactiveDebtLayout";

const DebtLayout = () => {
  const { debts, reqStatus, postDebt, putDebt, markDebtPaidOff, deleteDebt } =
    useDebts();

  const [selectedDebt, setSelectedDebt] = useState(null);
  const [modal, setModal] = useState(null);

  const displayedModal = useMemo(() => {
    switch (modal) {
      case "ADD":
        return (
          <AddDebtModal modal={modal} setModal={setModal} postDebt={postDebt} />
        );
      case "EDIT":
        return (
          <EditDebtModal
            debt={selectedDebt}
            modal={modal}
            setModal={setModal}
            putDebt={putDebt}
            reqStatus={reqStatus}
          />
        );
      case "PAID OFF":
        return (
          <PaidOffDebtModal
            debt={selectedDebt}
            markDebtPaidOff={markDebtPaidOff}
            reqStatus={reqStatus}
            modal={modal}
            setModal={setModal}
          />
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

  const activeDebts = useMemo(() => {
    if (!debts) {
      return null;
    }

    return debts.filter((debt) => debt.active);
  }, [debts]);

  const inactiveDebts = useMemo(() => {
    if (!debts) {
      return null;
    }

    return debts.filter((debt) => !debt.active);
  }, [debts]);

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

                  {activeDebts.length > 0 ? (
                    <Row className="g-3">
                      {activeDebts.map((debt) => (
                        <Col key={debt._id} xs={12} lg={6}>
                          <DebtCard
                            debt={debt}
                            setSelectedDebt={setSelectedDebt}
                            setModal={setModal}
                          />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <p className="text-center fw-bold">
                      Congrats! You have no active debt!
                    </p>
                  )}

                  {inactiveDebts.length > 0 && (
                    <InactiveDebtLayout inactiveDebts={inactiveDebts} />
                  )}
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
