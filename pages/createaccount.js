import CreateUser from "@/components/createUser";
import Loading from "@/components/loading";
import { useSession } from "next-auth/react";

export default function CreateAccount() {
    const { status } = useSession();

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading') {
        return <Loading />;
    } else {
        return <CreateUser />;
    }
};