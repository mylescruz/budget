import usePaystubs from "@/hooks/usePaystubs";
import IncomeTable from "./incomeTable";
import dateInfo from "@/helpers/dateInfo";
import AddIncome from "./addIncome";
import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";

const IncomeLayout = () => {
    const { paystubs, addNewPaystub } = usePaystubs(dateInfo.currentYear);
    const [addPaystubClicked, setAddPaystubClicked] = useState(false);

    const addToPaystubs = (newPaystub) => {
        addNewPaystub(newPaystub);
    };

    const addPaystub = () => {
        setAddPaystubClicked(true);
    };

    const addIncomeProps = {
        paystubs: paystubs, 
        addToPaystubs: addToPaystubs,
        addPaystubClicked: addPaystubClicked,
        setAddPaystubClicked:  setAddPaystubClicked
    };

    return (
        <>
            <Row className="option-buttons text-center">
                <Col><Button id="add-paystub-btn" variant="primary" onClick={addPaystub}>Add Paystub</Button></Col>
            </Row>
            
            <IncomeTable paystubs={paystubs}/>

            {addPaystubClicked && <AddIncome {...addIncomeProps} />}
        </>
    );
};

export default IncomeLayout;