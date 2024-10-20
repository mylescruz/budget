import Footer from "@/components/footer";
import Header from "@/components/header";
import Home from "@/components/home";
import MonthLayout from "@/components/month/monthLayout";
import "@/styles/globals.css";

const App = () => {
    return (
      <>
        <Header />
        {/* <MonthLayout /> */}
        <Home />
        <Footer />
      </>
    );
  };
  
export default App;