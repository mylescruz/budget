import Footer from "@/components/footer";
import Header from "@/components/header";
import Home from "@/components/home";
import PaystubLayout from "@/components/paystubs/paystubLayout";
import MonthLayout from "@/components/month/monthLayout";
import "@/styles/globals.css";

const App = () => {
    return (
      <>
        <Header />
        {/* <MonthLayout /> */}
        <Home />
        {/* <PaystubLayout /> */}
        <Footer />
      </>
    );
  };
  
export default App;