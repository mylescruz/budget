import ErrorLayout from "@/components/errors/errorLayout";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Page() {
    const { status } = useSession();
    const router = useRouter();

    const message = router?.query.message;

    // Create a loading indicator while check on the status of a user's session
    if (status === 'loading')
        return <Loading />;
    else
        return <ErrorLayout message={message} />
};