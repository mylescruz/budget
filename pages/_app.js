import "@/styles/globals.css";
import Layout from "@/components/layout";
import { SessionProvider } from "next-auth/react";

// Main App Component
// Wrapped around by the NextAuth.js Session Provider

const App = ({ Component, pageProps: {session, ...pageProps} }) => {
    return (
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    );
  };
  
export default App;