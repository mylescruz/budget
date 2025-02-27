import PaystubLayout from "@/components/paystubs/paystubLayout";
import dateInfo from "@/helpers/dateInfo";
import { Spinner } from "react-bootstrap";

export default function Income() {
    const year = dateInfo.currentYear;

    if (!year) {
        return (
            <>
                <h1 className="text-center">Loading user income</h1>
                <Spinner animation="border" variant="primary" className="mx-auto" />
            </>
        );
    }

    return (
        <PaystubLayout year={year} />
    );
};