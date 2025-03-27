import AccountLayout from "@/components/account/accountLayout";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Account() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading')
        return <Loading/>;
    else if (!session)
        router.push('/redirect');
    else
        return <AccountLayout />;
}
