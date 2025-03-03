import { useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";
import useHistory from "@/hooks/useHistory";
import addIncomeToHistoryBudget from "@/helpers/addIncomeToHistoryBudget";
import { useSession } from "next-auth/react";

const AddIncome = ({income, yearInfo, postIncome, addPaycheckClicked, setAddPaycheckClicked}) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    const emptyPaycheck = {
        id: 0,
        date: dateInfo.currentDate,
        company: "",
        description: "",
        gross: 0,
        taxes: 0,
        net: 0
    };
    
    const [paycheck, setPaycheck] = useState(emptyPaycheck);
    const { history, putHistory } = useHistory(session.user.username);

    const handleInput = (e) => {
        setPaycheck({ ...paycheck, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setPaycheck({ ...paycheck, [e.target.id]: input });
        else
            setPaycheck({ ...paycheck, [e.target.id]: parseFloat(input) });
    };

    const AddNewPaycheck = (e) => {
        e.preventDefault();

        // Find the max ID in the income array and add one for the new ID
        let maxID = 0;
        if (income.length > 0)
            maxID = Math.max(...income.map(paycheck => paycheck.id));

        paycheck.id = maxID + 1;
        paycheck.taxes = parseFloat((paycheck.gross - paycheck.net).toFixed(2));

        // Adds the new paycheck to the income array by sending a POST request to the API
        postIncome(paycheck);

        // Updates the budget value for the given month in the history array by sending a PUT request to the API
        const paycheckMonth = addIncomeToHistoryBudget(paycheck, history);
        putHistory(paycheckMonth);

        setPaycheck(emptyPaycheck);
        setAddPaycheckClicked(false);
    };

    const closeModal = () => {
        setPaycheck(emptyPaycheck);
        setAddPaycheckClicked(false);
    }

    return (
        <Modal show={addPaycheckClicked} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Enter paycheck information</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={AddNewPaycheck}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Label>Pay Date</Form.Label>
                        <Form.Control id="date" className="h-100" type="date" min={yearInfo.startOfYear} max={yearInfo.endOfYear} value={paycheck.date} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Company</Form.Label>
                        <Form.Control id="company" className="h-100" type="text" value={paycheck.company} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Description</Form.Label>
                        <Form.Control id="description" className="h-100" type="text" value={paycheck.description} placeholder="Optional" onChange={handleInput} />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Gross Income</Form.Label>
                        <Form.Control id="gross" className="h-100" type="number" min="0.01" step="0.01" placeholder="Gross Income" value={paycheck.gross} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Net Income</Form.Label>
                        <Form.Control id="net" className="h-100" type="number" min="0.01" step="0.01" placeholder="Net Income" value={paycheck.net} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Taxes taken out</Form.Label>
                        <Form.Control id="taxes" className="h-100" type="number" min="0.01" step="0.01" placeholder="Taxes taken out" value={(paycheck.gross-paycheck.net).toFixed(2)} disabled required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group className="formInput">
                        <Row>
                            <Col><Button variant="secondary" onClick={closeModal}>Close</Button></Col>
                            <Col><Button variant="primary" type="submit">Add</Button></Col>
                        </Row>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddIncome;