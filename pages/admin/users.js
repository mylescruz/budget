import UsersLayout from "@/components/admin/users/usersLayout";
import LoadingIndicator from "@/components/layout/loadingIndicator";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Users() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (session.user.role !== "Administrator") router.push("/");
  else {
    return (
      <>
        <Head>
          <title>Users</title>
          <meta name="description" content="Admin's view of all the users" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <UsersLayout />
      </>
    );
  }
}
