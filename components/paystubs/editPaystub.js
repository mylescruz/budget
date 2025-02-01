import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

const EditPaystub = ({ paystub, updatePaystub, yearInfo, showEdit, setShowEdit, setShowDetails }) => {
    const [edittedPaystub, setEdittedPaystub] = useState(paystub);

    const handleInput = (e) => {
        setEdittedPaystub({ ...edittedPaystub, [e.target.id]: e.target.value});
    };

    const handleNumInput = (e) => {
        const input = e.target.value;

        if (input == '')
            setEdittedPaystub({ ...edittedPaystub, [e.target.id]: input });
        else
            setEdittedPaystub({ ...edittedPaystub, [e.target.id]: parseFloat(input) });
    };

    const closeEdit = () => {
        setShowEdit(false);
        setShowDetails(true);
    };

    const editPaystub = (e) => {
        e.preventDefault();

        edittedPaystub.taxes = edittedPaystub.gross-edittedPaystub.net;

        updatePaystub(edittedPaystub);
        setShowEdit(false);  
    };

    return (
        <Modal show={showEdit} onHide={closeEdit} centered>
            <Modal.Header>
                <Modal.Title>Edit Paystub</Modal.Title>
            </Modal.Header>
            <Form onSubmit={editPaystub}>
                <Modal.Body>
                <Form.Group className="formInput">
                        <Form.Label>Pay Date</Form.Label>
                        <Form.Control id="date" className="h-100" type="date" min={yearInfo.startOfYear} max={yearInfo.endOfYear} value={edittedPaystub.date} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Company</Form.Label>
                        <Form.Control id="company" className="h-100" type="text" value={edittedPaystub.company} onChange={handleInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Description</Form.Label>
                        <Form.Control id="description" className="h-100" type="text" value={edittedPaystub.description} placeholder="Optional" onChange={handleInput} />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Gross Income</Form.Label>
                        <Form.Control id="gross" className="h-100" type="number" min="0.01" step="0.01" placeholder="Gross Income" value={edittedPaystub.gross} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Net Income</Form.Label>
                        <Form.Control id="net" className="h-100" type="number" min="0.01" step="0.01" placeholder="Net Income" value={edittedPaystub.net} onChange={handleNumInput} required />
                    </Form.Group>
                    <Form.Group className="formInput">
                        <Form.Label>Taxes taken out</Form.Label>
                        <Form.Control id="taxes" className="h-100" type="number" min="0.01" step="0.01" placeholder="Taxes taken out" value={edittedPaystub.gross-edittedPaystub.net} disabled required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Form.Group className="formInput">
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

export default EditPaystub;