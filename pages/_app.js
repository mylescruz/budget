import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import AppLayout from "@/components/layout/appLayout";

// Main App Component
// Wrapped around by the NextAuth.js Session Provider

const App = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </SessionProvider>
  );
};

export default App;
