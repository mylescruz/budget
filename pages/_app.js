import Footer from "@/components/footer";
import Header from "@/components/header";
import Home from "@/components/home";
import IncomeLayout from "@/components/income/incomeLayout";
import MonthLayout from "@/components/month/monthLayout";
import "@/styles/globals.css";

const App = () => {
    return (
      <>
        <Header />
        <MonthLayout />
        {/* <Home /> */}
        {/* <IncomeLayout /> */}
        <Footer />
      </>
    );
  };
  
export default App;