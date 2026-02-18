import PopUp from "@/components/layout/popUp";
import subtractDecimalValues from "@/helpers/subtractDecimalValues";
import { Button, Form } from "react-bootstrap";

const repeatOptions = ["Weekly", "Bi-Weekly", "Monthly"];

const PaycheckForm = ({ source, handleInput, year, setRepeating }) => {
  return (
    <>
      <Form.Group className="my-3">
        <Form.Label>What day did you get paid?</Form.Label>
        <Form.Control
          id="date"
          className="h-100"
          type="date"
          min={`${year}-01-01`}
          max={`${year}-12-31`}
          value={source.date}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>Who paid you?</Form.Label>
        <Form.Control
          id="name"
          className="h-100"
          type="text"
          value={source.name}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>
          What was your gross income?
          <PopUp
            title="The amount before deductions are taken out"
            id="gross-income-info"
          >
            <span className="mx-1"> &#9432;</span>
          </PopUp>
        </Form.Label>
        <Form.Control
          id="gross"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          value={source.gross}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>
          What was your net income?
          <PopUp
            title="The amount after deductions are taken out"
            id="net-income-info"
          >
            <span className="mx-1"> &#9432;</span>
          </PopUp>
        </Form.Label>
        <Form.Control
          id="amount"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          value={source.amount}
          onChange={handleInput}
          required
        />
      </Form.Group>
      <Form.Group className="my-3">
        <Form.Label>
          Calculated Deductions
          <PopUp
            title="The amount taken out from taxes, investments, healthcare, etc."
            id="deductions-info"
          >
            <span className="mx-1"> &#9432;</span>
          </PopUp>
        </Form.Label>
        <Form.Control
          id="deductions"
          className="h-100"
          type="number"
          min={0.01}
          step={0.01}
          value={subtractDecimalValues(source.gross, source.amount)}
          disabled
          required
        />
      </Form.Group>
      <Form.Group className="mt-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          id="description"
          className="h-100"
          type="text"
          value={source.description}
          placeholder="Optional"
          onChange={handleInput}
        />
      </Form.Group>
      <Form.Group controlId="repeating" className="my-3">
        <Form.Label>Is this a repeating paycheck?</Form.Label>
        <div>
          <Button
            className={`${
              source.repeating
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={setRepeating}
          >
            Yes
          </Button>
          <Button
            className={`mx-2 ${
              !source.repeating
                ? "bg-primary border border-primary"
                : "bg-secondary border border-secondary"
            }`}
            onClick={setRepeating}
          >
            No
          </Button>
        </div>
      </Form.Group>
      {source.repeating && (
        <div>
          <Form.Group controlId="frequency" className="mb-3">
            <Form.Label>How often do you get paid?</Form.Label>
            <Form.Select
              className="h-100"
              value={source.frequency}
              onChange={handleInput}
              required
            >
              {repeatOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="endRepeatDate" className="my-3">
            <Form.Label>Repeat until?</Form.Label>
            <Form.Control
              className="h-100"
              type="date"
              min={source.date}
              max={`${year}-12-31`}
              value={source.endRepeatDate}
              onChange={handleInput}
              required
            />
          </Form.Group>
        </div>
      )}
    </>
  );
};

export default PaycheckForm;
