import DebtLayout from "@/components/debt/debtLayout";
import LoadingIndicator from "@/components/ui/loadingIndicator";
import getDateInfo from "@/helpers/getDateInfo";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Debt() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const today = new Date();
  const dateInfo = getDateInfo(today);

  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    router.push("/redirect");
  } else {
    return (
      <>
        <Head>
          <title>Debt</title>
          <meta name="description" content="User's debt tracking" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DebtLayout />
      </>
    );
  }
}
