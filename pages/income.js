import PaystubLayout from "@/components/paystubs/paystubLayout";
import dateInfo from "@/helpers/dateInfo";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function Income() {
    const { status } = useSession();

    const year = dateInfo.currentYear;

    if (status === 'loading') {
        return (
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        return <PaystubLayout year={year} />;
    }
};