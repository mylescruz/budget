import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import PopUp from "@/components/layout/popUp";
import PaycheckForm from "@/components/income/incomeTypeForms/paycheckForm";
import SaleForm from "@/components/income/incomeTypeForms/saleForm";
import GiftForm from "@/components/income/incomeTypeForms/giftForm";
import UnemploymentForm from "@/components/income/incomeTypeForms/unemploymentForm";
import LoanForm from "@/components/income/incomeTypeForms/loanForm";

const incomeTypes = ["Paycheck", "Sale", "Gift", "Unemployment", "Loan"];

const IncomeSection = ({ dateInfo, newUser, setNewUser, openComplete }) => {
  const emptySource = {
    type: "Paycheck",
    date: dateInfo.date,
    name: "",
    description: "",
    gross: "",
    deductions: "",
    amount: "",
  };

  const [source, setSource] = useState(emptySource);

  const handleInput = (e) => {
    if (e.target.id === "type") {
      setSource({ ...emptySource, type: e.target.value });
    } else {
      setSource({ ...source, [e.target.id]: e.target.value });
    }
  };

  // Update the new income array with the user's inputted sources
  const addSource = (e) => {
    e.preventDefault();

    if (source.type === "Unemployment") {
      source.name = "EDD";
    }

    setNewUser({ ...newUser, income: [...newUser.income, source] });

    setSource(emptySource);
  };

  const completeOnboarding = () => {
    openComplete();
  };

  const incomeFormProps = {
    source: source,
    handleInput: handleInput,
    year: dateInfo.year,
  };

  return (
    <Container className="col-12 col-lg-8">
      <Card className="card-background px-2 py-3">
        <h4 className="text-center my-2">Let&#39;s enter your income</h4>

        <p className="text-center mb-4">
          Enter your sources of income for this month
          <PopUp
            title="You can always add or edit these sources later!"
            id="categories-question"
          >
            <span> &#9432;</span>
          </PopUp>
        </p>

        <Row className="col-12 my-2 mx-auto">
          <Col className="col-12 col-md-6">
            <Form onSubmit={addSource}>
              <Form.Group className="my-2">
                <Form.Label>What type of income is this?</Form.Label>
                <Form.Select
                  id="type"
                  className="h-100"
                  value={source.type}
                  onChange={handleInput}
                  required
                >
                  {incomeTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {source.type === "Paycheck" && (
                <PaycheckForm {...incomeFormProps} />
              )}
              {source.type === "Sale" && <SaleForm {...incomeFormProps} />}
              {source.type === "Gift" && <GiftForm {...incomeFormProps} />}
              {source.type === "Unemployment" && (
                <UnemploymentForm {...incomeFormProps} />
              )}
              {source.type === "Loan" && <LoanForm {...incomeFormProps} />}
              <Button type="submit" className="w-100 my-2">
                Add Income
              </Button>
            </Form>
          </Col>
          <Col className="col-12 col-md-6">
            <h6 className="text-center mt-4 mt-md-0 fw-bold">Income Entered</h6>
            <Table borderless className="mx-auto">
              <thead>
                <tr className="d-flex">
                  <th className="col-8 gray-background">Source</th>
                  <th className="col-4 text-end gray-background">Amount</th>
                </tr>
              </thead>
              <tbody>
                {newUser.income.map((source, index) => (
                  <tr key={index} className="d-flex">
                    <td className="col-8 gray-background">{source.name}</td>
                    <td className="col-4 text-end gray-background">
                      ${source.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {newUser.income.length > 0 && (
              <div className="text-end">
                <Button onClick={completeOnboarding}>Done</Button>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default IncomeSection;
