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
            <h1 className="text-center my-2">{year} Income</h1>

            <Row className="text-center">
                <Col><Button id="add-paystub-btn" variant="primary" onClick={addPay}>Add Paystub</Button></Col>
            </Row>
            
            <PaystubTable paystubs={paystubs} putPaystub={putPaystub} deletePaystub={deletePaystub} yearInfo={yearInfo} />

            {addPaystubClicked && <AddPaystub {...addPaystubProps} />}
        </>
    );
};

export default PaystubLayout;