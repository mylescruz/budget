import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row, Spinner } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import updateGuiltFreeSpending from "@/helpers/updateGuiltFreeSpending";
import dateToMonthInfo from "@/helpers/dateToMonthInfo";
import LoadingMessage from "../layout/loadingMessage";

const AddIncomeModal = ({
  yearInfo,
  postIncome,
  addPaycheckClicked,
  setAddPaycheckClicked,
  getMonthIncome,
}) => {
  // Using NextAuth.js to authenticate a user's session
  const { data: session } = useSession();

  const emptyPaycheck = {
    date: dateInfo.currentDate,
    company: "",
    description: "",
    gross: 0,
    taxes: 0,
    net: 0,
  };

  const { categories, putCategories } = useContext(CategoriesContext);
  const [paycheck, setPaycheck] = useState(emptyPaycheck);
  const { putHistory, getMonthHistory } = useHistory(session.user.username);
  const [addingPaycheck, setAddingPaycheck] = useState(false);

  const handleInput = (e) => {
    setPaycheck({ ...paycheck, [e.target.id]: e.target.value });
  };

  const handleNumInput = (e) => {
    const input = e.target.value;

    if (input == "") setPaycheck({ ...paycheck, [e.target.id]: input });
    else setPaycheck({ ...paycheck, [e.target.id]: parseFloat(input) });
  };

  const AddNewPaycheck = async (e) => {
    setAddingPaycheck(true);

    try {
      e.preventDefault();

      // Update the paycheck's taxes taken out
      paycheck.taxes = parseFloat((paycheck.gross - paycheck.net).toFixed(2));

      // Adds the new paycheck to the income array by sending a POST request to the API
      await postIncome(paycheck);

      const paycheckMonthInfo = dateToMonthInfo(paycheck.date);

      // Get the income for the month of the paycheck
      const monthIncome = getMonthIncome(paycheckMonthInfo);

      // Get the history for the month of the paycheck
      const paycheckMonth = getMonthHistory(paycheckMonthInfo);

      if (paycheckMonth) {
        // Update the budget for the month the paycheck is in
        const updatedBudget = monthIncome + paycheck.net;
        const updatedLeftover = parseFloat(
          (updatedBudget - paycheckMonth.actual).toFixed(2)
        );

        // Update the budget and leftover in the history and send it to the API
        const updatedPaycheckMonth = {
          ...paycheckMonth,
          budget: updatedBudget,
          leftover: updatedLeftover,
        };

        await putHistory(updatedPaycheckMonth);

        // Updates the categories by sending a PUT request to the API
        const updatedCategories = updateGuiltFreeSpending(
          updatedBudget,
          categories
        );
        await putCategories(updatedCategories);
      }

      setAddPaycheckClicked(false);
      setPaycheck(emptyPaycheck);
    } catch (error) {
      console.error("Error adding new income: ", error);
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
                    min={yearInfo.startOfYear}
                    max={yearInfo.endOfYear}
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

export default AddIncomeModal;
