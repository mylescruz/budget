import Footer from "./footer";
import HeaderLayout from "./header/headerLayout";

// The main component that sets the layout for the webpage
export default function AppLayout({ children }) {
  return (
    <div className="page-layout">
      <HeaderLayout />
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
}
