import SummaryTable from "@/components/summarytable";
import Title from "@/components/title";
import Transactions from "@/components/transactions";
import "@/styles/globals.css";

const App = () => {
    return (
      <>
        <Title />
        <SummaryTable />
        <Transactions />
      </>
    );
  };
  
export default App;