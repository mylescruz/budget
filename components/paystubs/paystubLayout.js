import usePaystubs from "@/hooks/usePaystubs";
import PaystubTable from "./paystubTable";
import AddPaystub from "./addPaystub";
import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import getYearInfo from "@/helpers/getYearInfo";

const PaystubLayout = ({ year }) => {
    const { paystubs, addNewPaystub, updatePaystub, deleteFromPaystubs } = usePaystubs(year);
    const [addPaystubClicked, setAddPaystubClicked] = useState(false);
    const yearInfo = getYearInfo(year);

    const addPay = () => {
        setAddPaystubClicked(true);
    };

    const addPaystubProps = {
        paystubs: paystubs,
        yearInfo: yearInfo,
        addNewPaystub: addNewPaystub,
        addPaystubClicked: addPaystubClicked,
        setAddPaystubClicked:  setAddPaystubClicked
    };

    return (
        <>
            <Row className="option-buttons text-center">
                <Col><Button id="add-paystub-btn" variant="primary" onClick={addPay}>Add Paystub</Button></Col>
            </Row>
            
            <PaystubTable paystubs={paystubs} updatePaystub={updatePaystub} deleteFromPaystubs={deleteFromPaystubs} year={yearInfo} />

            {addPaystubClicked && <AddPaystub {...addPaystubProps} />}
        </>
    );
};

export default PaystubLayout;