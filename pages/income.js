import PaystubLayout from "@/components/paystubs/paystubLayout";
import dateInfo from "@/helpers/dateInfo";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function Income() {
    const { status } = useSession();

    const year = dateInfo.currentYear;

    if (status === 'loading') {
        return (
            <>
                <h1 className="text-center">Loading user income</h1>
                <Spinner animation="border" variant="primary" className="mx-auto" />
            </>
        );
    } else {
        return <PaystubLayout year={year} />;
    }
};