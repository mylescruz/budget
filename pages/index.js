import Dashboard from "@/components/home/dashboard";
import Home from "@/components/home/home";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";

export default function Index() {
  const { data: session, status } = useSession();

  if (status === 'loading')
    return <Loading/>;
  else if (!session || status === 'unauthenticated')
    return <Home />;
  else
    return <Dashboard />;
};