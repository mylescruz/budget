import UsersLayout from "@/components/admin/users/usersLayout";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Users() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading")
        return <Loading/>;
    else if (session.user.role !== "Administrator")
        router.push('/');
    else
        return <UsersLayout />;
};