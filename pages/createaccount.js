import CreateUser from "@/components/createUser";
import { useSession } from "next-auth/react";
import { Spinner } from "react-bootstrap";

export default function CreateAccount() {
    const { status } = useSession();

    if (status === 'loading') {
        return <Spinner animation="border" variant="primary" className="mx-auto" />;
    } else {
        return <CreateUser />;
    }
};