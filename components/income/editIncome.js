import addIncomeToHistoryBudget from "@/helpers/addIncomeToHistoryBudget";
import deleteIncomeFromHistoryBudget from "@/helpers/deleteIncomeFromHistoryBudget";
import editIncomeForHistoryBudget from "@/helpers/editIncomeForHistoryBudget";
import useHistory from "@/hooks/useHistory";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const EditIncome = ({ paycheck, putIncome, yearInfo, showEdit, setShowEdit, setShowDetails }) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    const [edittedPaycheck, setEdittedPaycheck] = useState(paycheck);
    const { history, putHistory } = useHistory(session.user.username);

    const handleInput = (e) => {
        setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: input });
        else
            setEdittedPaycheck({ ...edittedPaycheck, [e.target.id]: parseFloat(input) });
    };

    const closeEdit = () => {
        setShowEdit(false);
        setShowDetails(true);
    };

    const editPaycheck = (e) => {
        e.preventDefault();

        edittedPaycheck.taxes = parseFloat((edittedPaycheck.gross-edittedPaycheck.net).toFixed(2));

        // Edits a paycheck in the income array by sending a PUT request to the API
        putIncome(edittedPaycheck);

        // Updates the budget value for the given month in the history array by sending a PUT request to the API
        if (edittedPaycheck.date === paycheck.date) {
            const paycheckMonth = editIncomeForHistoryBudget(edittedPaycheck, paycheck, history);
            putHistory(paycheckMonth);
        } else {
            const oldPaycheckMonth = deleteIncomeFromHistoryBudget(paycheck, history);
            putHistory(oldPaycheckMonth);

            const newPaycheckMonth = addIncomeToHistoryBudget(edittedPaycheck, history);
            putHistory(newPaycheckMonth);
        }

        setShowEdit(false);  
    };

    return (
        <Modal show={showEdit} onHide={closeEdit} centered>
            <Modal.Header>
                <Modal.Title>Edit Paycheck</Modal.Title>
            </Modal.Header>
            <Form onSubmit={editPaycheck}>
                <Modal.Body>
                <Form.Group className="my-2">
                        <Form.Label>Pay Date</Form.Label>
                        <Form.Control id="date" className="h-100" type="date" min={yearInfo.startOfYear} max={yearInfo.endOfYear} value={edittedPaycheck.date} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="my-2">
                        <Form.Label>Company</Form.Label>
                        <Form.Control id="company" className="h-100" type="text" value={edittedPaycheck.company} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="my-2">
                        <Form.Label>Description</Form.Label>
                        <Form.Control id="description" className="h-100" type="text" value={edittedPaycheck.description} placeholder="Optional" onChange={handleInput} />
                    </Form.Group>
                    <Form.Group className="my-2">
                        <Form.Label>Gross Income</Form.Label>
                        <Form.Control id="gross" className="h-100" type="number" min="0.01" step="0.01" placeholder="Gross Income" value={edittedPaycheck.gross} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="my-2">
                        <Form.Label>Net Income</Form.Label>
                        <Form.Control id="net" className="h-100" type="number" min="0.01" step="0.01" placeholder="Net Income" value={edittedPaycheck.net} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="my-2">
                        <Form.Label>Taxes taken out</Form.Label>
                        <Form.Control id="taxes" className="h-100" type="number" min="0.01" step="0.01" placeholder="Taxes taken out" value={(edittedPaycheck.gross-edittedPaycheck.net).toFixed(2)} disabled required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group className="my-2">
                        <Row>
                            <Col><Button variant="secondary" onClick={closeEdit}>Cancel</Button></Col>
                            <Col className="text-nowrap"><Button variant="primary" type="submit">Save Changes</Button></Col>
                        </Row>
                    </Form.Group>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default EditIncome;