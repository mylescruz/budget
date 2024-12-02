import { useContext, useState } from "react";
import { Form, Button, Modal, Col, Row } from "react-bootstrap";
import dateInfo from "@/helpers/dateInfo";

const AddIncome = ({paystubs, addToPaystubs, addPaystubClicked, setAddPaystubClicked}) => {
    const emptyPaystub = {
        id: 0,
        date: dateInfo.currentDate,
        company: "",
        gross: 0,
        taxes: 0,
        net: 0
    };
    
    const [paystub, setPaystub] = useState(emptyPaystub);

    const handleInput = (e) => {
        setPaystub({ ...paystub, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setPaystub({ ...paystub, [e.target.id]: input });
        else
            setPaystub({ ...paystub, [e.target.id]: parseFloat(input) });
    };

    const AddNewPaystub = (e) => {
        e.preventDefault();

        let maxID = 0;
        if (paystubs.length > 0)
            maxID = Math.max(...paystubs.map(paystub => paystub.id));

        paystub.id = maxID + 1;
        paystub.taxes = paystub.gross - paystub.net;
        addToPaystubs(paystub);

        setPaystub(emptyPaystub);
        setAddPaystubClicked(false);
    };

    const closeModal = () => {
        setPaystub(emptyPaystub);
        setAddPaystubClicked(false);
    }

    return (
        <Modal show={addPaystubClicked} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Enter paystub information</Modal.Title>
            </Modal.Header>
            
            <Form onSubmit={AddNewPaystub}>
                <Modal.Body>
                    <Form.Group className="formInput">
                        <Form.Label>Pay Date</Form.Label>
                        <Form.Control id="date" className="h-100" type="date" min={dateInfo.minDate} max={dateInfo.maxDate} value={paystub.date} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Company worked for</Form.Label>
                        <Form.Control id="company" className="h-100" type="text" value={paystub.store} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Gross Income</Form.Label>
                        <Form.Control id="gross" className="h-100" type="number" min="0.01" step="0.01" placeholder="Gross Income" value={paystub.gross} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Net Income</Form.Label>
                        <Form.Control id="net" className="h-100" type="number" min="0.01" step="0.01" placeholder="Net Income" value={paystub.net} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Taxes taken out</Form.Label>
                        <Form.Control id="taxes" className="h-100" type="number" min="0.01" step="0.01" placeholder="Taxes taken out" value={paystub.gross-paystub.net} disabled required />
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