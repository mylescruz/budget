import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";

const EditPaycheckModal = ({
  paycheck,
  putPaycheck,
  year,
  showEdit,
  setShowEdit,
  setShowDetails,
}) => {
  const [edittedPaycheck, setEdittedPaycheck] = useState({
    ...paycheck,
    gross: paycheck.gross / 100,
    taxes: paycheck.taxes / 100,
    net: paycheck.net / 100,
  });
  const [makingChanges, setMakingChanges] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input === "") {
      setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: input });
    } else {
      setEdittedPaycheck({
        ...edittedPaycheck,
        [e.target.id]: parseFloat(input),
      });
    }
  };

  const closeEditModal = () => {
    setShowEdit(false);
    setShowDetails(true);
  };

  const updatePaycheck = async (e) => {
    e.preventDefault();

    setMakingChanges(true);

    try {
      await putPaycheck({
        ...edittedPaycheck,
        oldDate: paycheck.date,
      });

      setShowEdit(false);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error(error);
      return;
    } finally {
      setMakingChanges(false);
    }
  };

  return (
    <Modal show={showEdit} onHide={closeEditModal} centered>
      {!makingChanges ? (
        <>
          <Modal.Header>
            <Modal.Title>Edit Paycheck</Modal.Title>
          </Modal.Header>
          <Form onSubmit={updatePaycheck}>
            <Modal.Body>
              <Form.Group className="my-2">
                <Form.Label>Pay Date</Form.Label>
                <Form.Control
                  id="date"
                  className="h-100"
                  type="date"
                  min={`${year}-01-01`}
                  max={`${year}-12-31`}
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
            <Modal.Footer className="my-2 d-flex justify-content-between">
              <Button variant="secondary" onClick={closeEditModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="text-nowrap">
                Save Changes
              </Button>
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
