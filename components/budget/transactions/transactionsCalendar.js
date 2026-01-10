import { TransactionsContext } from "@/contexts/TransactionsContext";
import { useContext, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import styles from "@/styles/budget/transactions/transactionsCalendar.module.css";
import { CategoriesContext } from "@/contexts/CategoriesContext";
import TransactionDetailsModal from "./transactionDetailsModal";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WEEK_LENGTH = 7;

const TransactionsCalendar = ({ dateInfo }) => {
  const { transactions } = useContext(TransactionsContext);
  const { categories, categoryColors } = useContext(CategoriesContext);

  const [chosenTransaction, setChosenTransaction] = useState({});
  const [modal, setModal] = useState("none");

  const openTransaction = (transaction) => {
    setChosenTransaction(transaction);

    setModal("details");
  };

  const monthCalendar = useMemo(() => {
    // Create the 2-D array for the given month
    const monthNumber = dateInfo.month - 1;
    const year = dateInfo.year;
    const daysInMonth = parseInt(dateInfo.endOfMonth.split("-")[2]);

    // Create the transactions map with the category's color
    const transactionsMap = new Map();

    transactions.forEach((transaction) => {
      if (!transactionsMap.has(transaction.date)) {
        transactionsMap.set(transaction.date, []);
      }

      transactionsMap.get(transaction.date).push({
        _id: transaction._id,
        date: transaction.date,
        store: transaction.store,
        items: transaction.items,
        category: transaction.category,
        amount: transaction.amount,
        color: categoryColors[transaction.category],
        icon: "●",
        fromCalendar: true,
      });
    });

    // If dayOfMonth field is present in the fixed category or subcategory, add it to the transactions calendar
    categories.forEach((category) => {
      if (category.fixed) {
        if (category.subcategories.length > 0) {
          category.subcategories.forEach((subcategory) => {
            if (subcategory.dayOfMonth) {
              const subcategoryDate = new Date(
                year,
                monthNumber,
                subcategory.dayOfMonth
              );
              const subcategoryDateISO = subcategoryDate
                .toISOString()
                .split("T")[0];

              if (!transactionsMap.has(subcategoryDateISO)) {
                transactionsMap.set(subcategoryDateISO, []);
              }

              transactionsMap.get(subcategoryDateISO).push({
                _id: subcategory.id,
                date: subcategoryDateISO,
                store: subcategory.name,
                items: "Fixed Subcategory",
                category: category.name,
                amount: subcategory.actual,
                color: category.color,
                icon: "■",
                isCategory: true,
                fromCalendar: true,
              });
            }
          });
        } else {
          if (category.dayOfMonth) {
            const categoryDate = new Date(
              year,
              monthNumber,
              category.dayOfMonth
            );
            const categoryDateISO = categoryDate.toISOString().split("T")[0];

            if (!transactionsMap.has(categoryDateISO)) {
              transactionsMap.set(categoryDateISO, []);
            }

            transactionsMap.get(categoryDateISO).push({
              _id: category._id,
              date: categoryDateISO,
              store: category.name,
              items: "Fixed Category",
              category: category.name,
              amount: category.actual,
              color: category.color,
              icon: "■",
              isCategory: true,
              fromCalendar: true,
            });
          }
        }
      }
    });

    let week = 0;
    let month = [[]];
    for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
      const date = new Date(year, monthNumber, dayIndex + 1);
      const dateISO = date.toISOString().split("T")[0];
      const dateNumber = date.getUTCDate();
      const dayOfWeekIndex = date.getUTCDay();

      // Fill up the month array with empty days until the first day of the month
      if (dayIndex === 0 && dayOfWeekIndex !== 0) {
        for (
          let emptyDayIndex = 0;
          emptyDayIndex < dayOfWeekIndex;
          emptyDayIndex++
        ) {
          month[week].push({
            dateNumber: null,
            transactions: [],
          });
        }
      }

      // Create a new array row at the start of each week
      if (dayOfWeekIndex === 0) {
        week += 1;
        month.push([]);
      }

      // Add the dateNumber and date's transactions to the calendar
      month[week].push({
        dateNumber,
        transactions: transactionsMap.get(dateISO) ?? [],
      });

      // At the end of the month, fill up the month array with empty days
      if (dayIndex + 1 === daysInMonth && dayOfWeekIndex !== WEEK_LENGTH - 1) {
        for (
          let emptyDayIndex = dayOfWeekIndex;
          emptyDayIndex < WEEK_LENGTH - 1;
          emptyDayIndex++
        ) {
          month[week].push({
            dateNumber: null,
            transactions: [],
          });
        }
      }
    }

    return month;
  }, [dateInfo, categories, categoryColors, transactions]);

  return (
    <>
      <Table striped className={styles.equal_columns}>
        <thead>
          <tr className="table-dark">
            {DAYS_OF_WEEK.map((day, index) => (
              <td key={index} className="fw-bold text-center">
                <span className="d-md-none">{day.slice(0, 1)}</span>
                <span className="d-none d-md-block">{day}</span>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {monthCalendar.map((week, weekIndex) => (
            <tr key={weekIndex} className={styles.fixed_height}>
              {week.map((day, index) => (
                <td key={index}>
                  <p className="fw-bold text-dark">{day.dateNumber}</p>
                  <div className="d-flex flex-wrap justify-content-center">
                    {day.transactions.map((transaction) => (
                      <span
                        key={transaction._id}
                        style={{ color: transaction.color }}
                        className="mx-md-1 fs-2 clicker"
                        onClick={() => openTransaction(transaction)}
                      >
                        {transaction.icon}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      <TransactionDetailsModal
        transaction={chosenTransaction}
        modal={modal}
        setModal={setModal}
      />
    </>
  );
};

export default TransactionsCalendar;
