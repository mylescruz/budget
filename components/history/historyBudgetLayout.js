import BudgetLayout from "../budget/budgetLayout";
import styles from "@/styles/history/historyBudget.module.css";
import Link from "next/link";

const HistoryBudgetLayout = ({ monthInfo }) => {
  return (
    <>
      <div className={styles.backContainer}>
        <Link href="/history">&#8592; Back to History</Link>
      </div>
      <BudgetLayout monthInfo={monthInfo} />
    </>
  );
};

export default HistoryBudgetLayout;
