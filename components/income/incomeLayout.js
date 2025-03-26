import useIncome from "@/hooks/useIncome";
import IncomeTable from "./incomeTable";
import AddIncome from "./addIncome";
import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import getYearInfo from "@/helpers/getYearInfo";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Loading from "../layout/loading";

const IncomeLayout = ({ year }) => {
    // Using NextAuth.js to authenticate a user's session
    const { data: session } = useSession();

    // Using the router object to redirect to different pages within the app
    const router = useRouter();

    const { income, incomeLoading, postIncome, putIncome, deleteIncome } = useIncome(session.user.username, year);
    const [addPaycheckClicked, setAddPaycheckClicked] = useState(false);
    const yearInfo = getYearInfo(year);

    // If there is no user session, redirect to the home page
    if (!session) {
        router.push('/');
    }

    // If the income is still being loaded by the API, show the loading component
    if (incomeLoading) {
        return <Loading />;
    }

    const addPay = () => {
        setAddPaycheckClicked(true);
    };

    const addIncomeProps = {
        income: income,
        yearInfo: yearInfo,
        postIncome: postIncome,
        addPaycheckClicked: addPaycheckClicked,
        setAddPaycheckClicked:  setAddPaycheckClicked
    };

    return (
        <>
            <aside className="info-text text-center my-4 mx-auto">
                <h1>{year} Income</h1>
                <p>View and add your paychecks for the current year. View your gross and net income and see how much taxes have been taken out.</p>
            </aside>

            <Row className="text-center">
                <Col><Button id="add-paycheck-btn" variant="primary" onClick={addPay}>Add Paycheck</Button></Col>
            </Row>
            
            <IncomeTable income={income} putIncome={putIncome} deleteIncome={deleteIncome} yearInfo={yearInfo} />

            {addPaycheckClicked && <AddIncome {...addIncomeProps} />}
        </>
    );
};

export default IncomeLayout;