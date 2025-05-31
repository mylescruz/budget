import Footer from "./footer";
import Header from "./header";

// The main component that sets the layout for the webpage
export default function AppLayout({ children }) {
  return (
    <div className="page-layout">
      <Header />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}
