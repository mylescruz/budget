import { useContext, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";
import { PaychecksContext } from "@/contexts/PaychecksContext";

const EditPaycheckModal = ({
  paycheck,
  yearInfo,
  showEdit,
  setShowEdit,
  setShowDetails,
}) => {
  const { putPaycheck } = useContext(PaychecksContext);

  const [edittedPaycheck, setEdittedPaycheck] = useState(paycheck);
  const [updatingPaycheck, setUpdatingPaycheck] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") {
      setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: input });
    } else {
      setEdittedPaycheck({
        ...edittedPaycheck,
        [e.target.id]: parseFloat(input),
      });
    }
  };

  const closeEdit = () => {
    setShowEdit(false);
    setShowDetails(true);
  };

  const editPaycheck = async (e) => {
    setUpdatingPaycheck(true);

    try {
      e.preventDefault();

      edittedPaycheck.taxes = parseFloat(
        (edittedPaycheck.gross - edittedPaycheck.net).toFixed(2)
      );

      // Edits a paycheck in the income array by sending a PUT request to the API
      await putPaycheck({
        ...edittedPaycheck,
        oldDate: paycheck.date,
        oldNet: paycheck.net,
      });

      setShowEdit(false);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setUpdatingPaycheck(false);
    }
  };

  return (
    <Modal show={showEdit} onHide={closeEdit} centered>
      {!updatingPaycheck ? (
        <>
          <Modal.Header>
            <Modal.Title>Edit Paycheck</Modal.Title>
          </Modal.Header>
          <Form onSubmit={editPaycheck}>
            <Modal.Body>
              <Form.Group className="my-2">
                <Form.Label>Pay Date</Form.Label>
                <Form.Control
                  id="date"
                  className="h-100"
                  type="date"
                  min={yearInfo.startOfYear}
                  max={yearInfo.endOfYear}
                  value={edittedPaycheck.date}
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
                  value={edittedPaycheck.company}
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
                  value={edittedPaycheck.description}
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
                  value={edittedPaycheck.gross}
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
                  value={edittedPaycheck.net}
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
                  value={(edittedPaycheck.gross - edittedPaycheck.net).toFixed(
                    2
                  )}
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
                    <Button variant="secondary" onClick={closeEdit}>
                      Cancel
                    </Button>
                  </Col>
                  <Col className="text-nowrap">
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Modal.Footer>
          </Form>
        </>
      ) : (
        <LoadingMessage message="Editting the paycheck" />
      )}
    </Modal>
  );
};

export default EditPaycheckModal;
