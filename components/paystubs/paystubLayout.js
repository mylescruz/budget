import usePaystubs from "@/hooks/usePaystubs";
import PaystubTable from "./paystubTable";
import dateInfo from "@/helpers/dateInfo";
import AddPaystub from "./addPaystub";
import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";

const PaystubLayout = () => {
    const { paystubs, addNewPaystub, updatePaystub, deleteFromPaystubs } = usePaystubs(dateInfo.currentYear);
    const [addPaystubClicked, setAddPaystubClicked] = useState(false);

    const addPay = () => {
        setAddPaystubClicked(true);
    };

    const addPaystubProps = {
        paystubs: paystubs, 
        addNewPaystub: addNewPaystub,
        addPaystubClicked: addPaystubClicked,
        setAddPaystubClicked:  setAddPaystubClicked
    };

    return (
        <>
            <Row className="option-buttons text-center">
                <Col><Button id="add-paystub-btn" variant="primary" onClick={addPay}>Add Paystub</Button></Col>
            </Row>
            
            <PaystubTable paystubs={paystubs} updatePaystub={updatePaystub} deleteFromPaystubs={deleteFromPaystubs} />

            {addPaystubClicked && <AddPaystub {...addPaystubProps} />}
        </>
    );
};

export default PaystubLayout;