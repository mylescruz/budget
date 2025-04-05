import Dashboard from "@/components/home/dashboard";
import Home from "@/components/home/home";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Index() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading')
    return <Loading/>;
  else if (!session || status === 'unauthenticated')
    return <Home />;
  else if (!session.user.onboarded)
    router.push('/onboarding');
  else
    return <Dashboard />;
};