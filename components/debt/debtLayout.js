import useDebts from "@/hooks/useDebts";
import { Col, Container, Row } from "react-bootstrap";
import LoadingIndicator from "../ui/loadingIndicator";
import ErrorMessage from "../ui/errorMessage";
import DebtHeader from "./debtHeader";
import DebtSummary from "./debtSummary";

const DebtLayout = () => {
  const { debts, reqStatus } = useDebts();

  if (reqStatus.isInitialLoad) {
    return <LoadingIndicator message={reqStatus.message} />;
  } else {
    return (
      <Container>
        <Row className="d-flex justify-content-center">
          <Col xs={12} xl={10}>
            <DebtHeader />

            {reqStatus.isInitialError ? (
              <ErrorMessage message={reqStatus.message} />
            ) : (
              <DebtSummary debts={debts} />
            )}
          </Col>
        </Row>
      </Container>
    );
  }
};

export default DebtLayout;
