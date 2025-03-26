import Home from "@/components/home/home";
import Loading from "@/components/layout/loading";
import { useSession } from "next-auth/react";

export default function Index() {
  const { status } = useSession();

  if (status === 'loading')
    return <Loading/>;
  else
    return <Home />;
};