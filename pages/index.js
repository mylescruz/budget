import Dashboard from "@/components/home/dashboard";
import Home from "@/components/home/home";
import LoadingIndicator from "@/components/layout/loadingIndicator";
import { useSession } from "next-auth/react";
import Head from "next/head";

export default function Index() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingIndicator />;
  } else if (!session || status === "unauthenticated") {
    return (
      <>
        <Head>
          <title>Home</title>
          <meta name="description" content="Type-A Budget Home" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Home />
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>Dashboard</title>
          <meta name="description" content="User's dashboard" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Dashboard />
      </>
    );
  }
}
