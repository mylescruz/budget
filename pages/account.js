import AccountLayout from "@/components/account/accountLayout";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Account() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loading />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>Account</title>
          <meta name="description" content="User's account information" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AccountLayout />;
      </>
    );
  }
}
