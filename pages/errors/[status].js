import ErrorLayout from "@/components/errorLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Spinner } from "react-bootstrap";

export default function Page() {
    const { status } = useSession();
    const router = useRouter();

    const responseStatus = router?.query?.status;

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading' || !responseStatus) {
        return (
            <div className="d-flex justify-content-center align-items-center loading-spinner">
                <Spinner animation="border" variant="primary"/>
            </div>
        );
    } else {
        return <ErrorLayout status={responseStatus} />
    }
};