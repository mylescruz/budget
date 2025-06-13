import dateToMonthInfo from "@/helpers/dateToMonthInfo";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import LoadingMessage from "../layout/loadingMessage";
import ErrorMessage from "../layout/errorMessage";

const EditIncomeModal = ({
  paycheck,
  putIncome,
  yearInfo,
  showEdit,
  setShowEdit,
  setShowDetails,
  getMonthIncome,
}) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const [edittedPaycheck, setEdittedPaycheck] = useState(paycheck);
  const { putHistory, getMonthHistory } = useHistory(session.user.username);
  const [updatingPaycheck, setUpdatingPaycheck] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleInput = (e) => {
    setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "")
      setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: input });
    else
      setEdittedPaycheck({
        ...edittedPaycheck,
        [e.target.id]: parseFloat(input),
      });
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
      await putIncome(edittedPaycheck);

      // Updates the budget value for the given month in the history array by sending a PUT request to the API
      if (edittedPaycheck.date === paycheck.date) {
        // Update the history for the current month
        const paycheckMonthInfo = dateToMonthInfo(edittedPaycheck.date);

        // Get the income for the month of the editted paycheck
        const paycheckMonthIncome = getMonthIncome(paycheckMonthInfo);

        // Get the history for the month of the editted paycheck
        const paycheckMonth = getMonthHistory(paycheckMonthInfo);

        if (paycheckMonth) {
          // Update the budget for the month the editted paycheck is in
          const updatedCurrentBudget =
            paycheckMonthIncome - paycheck.net + edittedPaycheck.net;
          const updatedCurrentLeftover = parseFloat(
            (updatedCurrentBudget - paycheckMonth.actual).toFixed(2)
          );

          // Update the budget and leftover in the history and send it to the API
          const updatedMonth = {
            ...paycheckMonth,
            budget: updatedCurrentBudget,
            leftover: updatedCurrentLeftover,
          };

          await putHistory(updatedMonth);
        }
      } else {
        // Update the history for the old month
        const oldMonthInfo = dateToMonthInfo(edittedPaycheck.date);

        // Get the income for the month of the old paycheck
        const oldIncome = getMonthIncome(oldMonthInfo);

        // Get the history for the month of the old paycheck
        const oldMonth = getMonthHistory(oldMonthInfo);

        if (oldMonth) {
          // Update the budget for the month the old paycheck is in
          const updatedOldBudget = oldIncome - paycheck.net;
          const updatedOldLeftover = parseFloat(
            (updatedOldBudget - oldMonth.actual).toFixed(2)
          );

          // Update the budget and leftover in the history and send it to the API
          const updatedOldMonth = {
            ...oldMonth,
            budget: updatedOldBudget,
            leftover: updatedOldLeftover,
          };

          await putHistory(updatedOldMonth);
        }

        // Update the history for the editted month
        const newMonthInfo = dateToMonthInfo(edittedPaycheck.date);

        // Get the income for the month of the editted paycheck
        const newIncome = getMonthIncome(newMonthInfo);

        // Get the history for the month of the editted paycheck
        const newMonth = getMonthHistory(newMonthInfo);

        if (newMonth) {
          // Update the budget for the month the editted paycheck is in
          const updatedNewBudget = newIncome - paycheck.net;
          const updatedNewLeftover = parseFloat(
            (updatedNewBudget - newMonth.actual).toFixed(2)
          );

          // Update the budget and leftover in the history and send it to the API
          const updatedNewMonth = {
            ...newMonth,
            budget: updatedNewBudget,
            leftover: updatedNewLeftover,
          };

          await putHistory(updatedNewMonth);
        }
      }

      setShowEdit(false);
      setErrorOccurred(false);
    } catch (error) {
      setErrorOccurred(true);
      console.error("Error editting a paycheck: ", error);
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

export default EditIncomeModal;
