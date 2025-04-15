import Dashboard from "@/components/home/dashboard";
import Home from "@/components/home/home";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Index() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading')
    return <Loading/>;
  else if (!session || status === 'unauthenticated') {
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
    )
  } else if (!session.user.onboarded)
    router.push('/onboarding');
  else {
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
    )
  }
};