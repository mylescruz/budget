import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import todayInfo from "@/helpers/todayInfo";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import { PaychecksContext } from "@/contexts/PaychecksContext";

const AddPaycheckModal = ({
  dateInfo,
  addPaycheckClicked,
  setAddPaycheckClicked,
}) => {
  const emptyPaycheck = {
    date: todayInfo.date,
    company: "",
    description: "",
    gross: 0,
    taxes: 0,
    net: 0,
  };

  const { postPaycheck } = useContext(PaychecksContext);

  const [paycheck, setPaycheck] = useState(emptyPaycheck);
  const [addingPaycheck, setAddingPaycheck] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setPaycheck({ ...paycheck, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") {
      setPaycheck({ ...paycheck, [e.target.id]: input });
    } else {
      setPaycheck({ ...paycheck, [e.target.id]: parseFloat(input) });
    }
  };

  const AddNewPaycheck = async (e) => {
    setAddingPaycheck(true);

    try {
      e.preventDefault();

      // Adds the new paycheck to the income array by sending a POST request to the API
      await postPaycheck(paycheck);

      setAddPaycheckClicked(false);
      setPaycheck(emptyPaycheck);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setAddingPaycheck(false);
    }
  };

  const closeModal = () => {
    setPaycheck(emptyPaycheck);
    setAddPaycheckClicked(false);
  };

  return (
    <>
      <Modal show={addPaycheckClicked} onHide={closeModal} centered>
        {!addingPaycheck ? (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Enter paycheck information</Modal.Title>
            </Modal.Header>

            <Form onSubmit={AddNewPaycheck}>
              <Modal.Body>
                <Form.Group className="my-2">
                  <Form.Label>Pay Date</Form.Label>
                  <Form.Control
                    id="date"
                    className="h-100"
                    type="date"
                    min={dateInfo.startOfYear}
                    max={dateInfo.endOfYear}
                    value={paycheck.date}
                    onChange={handleInput}
                    required
                  />
                </Form.Group>
                <Form.Group className="my-2">
                  <Form.Label>Company</Form.Label>
                  <Form.Control
                    id="company"
                    className="h-100"
                    type="text"
                    value={paycheck.company}
                    onChange={handleInput}
                    required
                  />
                </Form.Group>
                <Form.Group className="my-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    id="description"
                    className="h-100"
                    type="text"
                    value={paycheck.description}
                    placeholder="Optional"
                    onChange={handleInput}
                  />
                </Form.Group>
                <Form.Group className="my-2">
                  <Form.Label>Gross Income</Form.Label>
                  <Form.Control
                    id="gross"
                    className="h-100"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Gross Income"
                    value={paycheck.gross}
                    onChange={handleNumInput}
                    required
                  />
                </Form.Group>
                <Form.Group className="my-2">
                  <Form.Label>Net Income</Form.Label>
                  <Form.Control
                    id="net"
                    className="h-100"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Net Income"
                    value={paycheck.net}
                    onChange={handleNumInput}
                    required
                  />
                </Form.Group>
                <Form.Group className="my-2">
                  <Form.Label>Taxes taken out</Form.Label>
                  <Form.Control
                    id="taxes"
                    className="h-100"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Taxes taken out"
                    value={(paycheck.gross - paycheck.net).toFixed(2)}
                    disabled
                    required
                  />
                </Form.Group>
                {errorOccurred && <ErrorMessage />}
              </Modal.Body>
              <Modal.Footer>
                <Form.Group className="my-2">
                  <Row>
                    <Col>
                      <Button variant="secondary" onClick={closeModal}>
                        Close
                      </Button>
                    </Col>
                    <Col>
                      <Button variant="primary" type="submit">
                        Add
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Modal.Footer>
            </Form>
          </>
        ) : (
          <LoadingMessage message="Adding the new paycheck" />
        )}
      </Modal>
    </>
  );
};

export default AddPaycheckModal;
