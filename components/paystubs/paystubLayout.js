import usePaystubs from "@/hooks/usePaystubs";
import PaystubTable from "./paystubTable";
import AddPaystub from "./addPaystub";
import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import getYearInfo from "@/helpers/getYearInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const PaystubLayout = ({ year }) => {
    const { data: session } = useSession();
    const router = useRouter();

    const { paystubs, postPaystub, putPaystub, deletePaystub } = usePaystubs(session.user.username, year);
    const [addPaystubClicked, setAddPaystubClicked] = useState(false);
    const yearInfo = getYearInfo(year);

    if (!session) {
        // If no session, redirect to the home page
        router.push('/');
    }

    const addPay = () => {
        setAddPaystubClicked(true);
    };

    const addPaystubProps = {
        paystubs: paystubs,
        yearInfo: yearInfo,
        postPaystub: postPaystub,
        addPaystubClicked: addPaystubClicked,
        setAddPaystubClicked:  setAddPaystubClicked
    };

    return (
        <>
            <aside className="info-text text-center my-4 mx-auto">
                <h1>{year} Income</h1>
                <p>View and add your paychecks for the current year. View your gross and net income and see how much taxes have been taken out.</p>
            </aside>

            <Row className="text-center">
                <Col><Button id="add-paystub-btn" variant="primary" onClick={addPay}>Add Paycheck</Button></Col>
            </Row>
            
            <PaystubTable paystubs={paystubs} putPaystub={putPaystub} deletePaystub={deletePaystub} yearInfo={yearInfo} />

            {addPaystubClicked && <AddPaystub {...addPaystubProps} />}
        </>
    );
};

export default PaystubLayout;