import InputTransaction from "@/components/inputTransaction";
import SummaryTable from "@/components/summarytable";
import Title from "@/components/title";
import TransactionsTable from "@/components/transactionstable";
import "@/styles/globals.css";

const App = () => {
    return (
      <>
        <Title />
        <SummaryTable />
        <TransactionsTable />
        <InputTransaction />
      </>
    );
  };
  
export default App;