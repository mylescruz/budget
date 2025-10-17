import { useState } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import centsToDollars from "@/helpers/centsToDollars";

const IncomeSection = ({ dateInfo, newUser, setNewUser, openComplete }) => {
  const emptyPaycheck = {
    date: dateInfo.date,
    company: "",
    description: "",
    gross: 0,
    taxes: 0,
    net: 0,
  };

  const [paycheck, setPaycheck] = useState(emptyPaycheck);

  // Functions to set the input when adding a new category
  const handlePaycheckInput = (e) => {
    const input = e.target.value;

    setPaycheck({ ...paycheck, [e.target.id]: input });
  };

  const handlePaycheckNumInput = (e) => {
    const input = e.target.value;

    if (input === "") {
      setPaycheck({ ...paycheck, [e.target.id]: input });
    } else {
      setPaycheck({ ...paycheck, [e.target.id]: parseFloat(input) });
    }
  };

  // Update the new income array with the user's inputted paychecks
  const addPaycheck = (e) => {
    e.preventDefault();

    setNewUser({ ...newUser, paychecks: [...newUser.paychecks, paycheck] });

    setPaycheck(emptyPaycheck);
  };

  const completeOnboarding = () => {
    openComplete();
  };

  return (
    <>
      <h4 className="text-center my-2">Let&#39;s enter your income</h4>

      <p className="text-center mb-4">
        Enter your paychecks for this month
        <PopUp
          title="You can always add or edit these paychecks later!"
          id="categories-question"
        >
          <span> &#9432;</span>
        </PopUp>
      </p>

      <Row className="col-12 my-2 mx-auto">
        <Col className="col-12 col-md-6">
          <Form onSubmit={addPaycheck}>
            <Form.Group controlId="date">
              <Form.Label>Pay Date</Form.Label>
              <Form.Control
                className="h-100"
                type="date"
                min={dateInfo.startOfYear}
                max={dateInfo.endOfYear}
                value={paycheck.date}
                onChange={handlePaycheckInput}
                required
              />
            </Form.Group>
            <Form.Group controlId="company">
              <Form.Label>Company</Form.Label>
              <Form.Control
                className="h-100"
                type="text"
                value={paycheck.company}
                onChange={handlePaycheckInput}
                required
              />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                className="h-100"
                type="text"
                value={paycheck.description}
                placeholder="Optional"
                onChange={handlePaycheckInput}
              />
            </Form.Group>
            <Form.Group controlId="gross">
              <Form.Label>Gross Income</Form.Label>
              <Form.Control
                className="h-100"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Gross Income"
                value={paycheck.gross}
                onChange={handlePaycheckNumInput}
                required
              />
            </Form.Group>
            <Form.Group controlId="net">
              <Form.Label>Net Income</Form.Label>
              <Form.Control
                className="h-100"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Net Income"
                value={paycheck.net}
                onChange={handlePaycheckNumInput}
                required
              />
            </Form.Group>
            <Form.Group controlId="taxes">
              <Form.Label>Taxes taken out</Form.Label>
              <Form.Control
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
            <Button type="submit" className="w-100 my-2">
              Add Paycheck
            </Button>
          </Form>
        </Col>
        <Col className="col-12 col-md-6">
          <h6 className="text-center mt-4 mt-md-0 fw-bold">
            Paychecks Entered
          </h6>
          <Table borderless className="mx-auto">
            <thead>
              <tr className="d-flex">
                <th className="col-8 gray-background">Company</th>
                <th className="col-4 text-end gray-background">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              {newUser.paychecks.map((paycheck, index) => (
                <tr key={index} className="d-flex">
                  <td className="col-8 gray-background">{paycheck.company}</td>
                  <td className="col-4 text-end gray-background">
                    ${paycheck.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {newUser.paychecks.length > 0 && (
            <div className="text-end">
              <Button onClick={completeOnboarding}>Done</Button>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default IncomeSection;
