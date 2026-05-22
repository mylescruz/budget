import { Row } from "react-bootstrap";
import { useMemo } from "react";
import InsightCard from "./insightCard";
import dollarFormatter from "@/helpers/dollarFormatter";
import addDecimalValues from "@/helpers/addDecimalValues";
import { TRANSACTION_TYPES } from "@/lib/constants/transactions";

const SpendingInsightsLayout = ({ months, categories, transactions }) => {
  const insights = useMemo(() => {
    // Highest spending months
    const topSpendingMonths = [...months]
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 10)
      .map((month) => {
        return {
          name: month.name,
          value: dollarFormatter(month.actual),
        };
      });

    // Lowest spending months
    const lowestSpendingMonths = [...months]
      .sort((a, b) => a.actual - b.actual)
      .slice(0, 10)
      .map((month) => {
        return {
          name: month.name,
          value: dollarFormatter(month.actual),
        };
      });

    // Highest months where the user overspent
    const topOverspendingMonths = [...months]
      .filter((month) => month.remaining < 0)
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 10)
      .map((month) => {
        return {
          name: month.name,
          value: (
            <span className="fw-bold text-danger">
              {dollarFormatter(Math.abs(month.remaining))}
            </span>
          ),
        };
      });

    // Top spending changing categories
    const topSpendingCategories = [...categories]
      .filter((category) => !category.fixed)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 10)
      .map((category) => {
        return {
          name: category.name,
          value: dollarFormatter(category.actual),
        };
      });

    // Top spending fixed categories
    const topFixedCategories = [...categories]
      .filter((category) => category.fixed)
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 10)
      .map((category) => {
        return {
          name: category.name,
          value: dollarFormatter(category.actual),
        };
      });

    // Top overspending categories
    const topOverspendingCategories = [...categories]
      .filter((category) => category.remaining < 0)
      .sort((a, b) => a.remaining - b.remaining)
      .slice(0, 10)
      .map((category) => {
        return {
          name: category.name,
          value: (
            <span className="fw-bold text-danger">
              {dollarFormatter(Math.abs(category.remaining))}
            </span>
          ),
        };
      });

    const variableTransactions = transactions.filter(
      (transaction) =>
        transaction.type === TRANSACTION_TYPES.EXPENSE && !transaction.fixed,
    );

    // Top transactions of the year
    const topTransactions = variableTransactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((transaction) => {
        return {
          name: transaction.store,
          value: dollarFormatter(transaction.amount),
        };
      });

    // Create a stores map to get the total spent at each store and how many times a user visited
    const storesMap = new Map();

    variableTransactions.forEach((transaction) => {
      const store = storesMap.get(transaction.store);

      if (!store) {
        storesMap.set(transaction.store, {
          store: transaction.store,
          amount: transaction.amount,
          visits: 1,
        });
      } else {
        const totalSpent = addDecimalValues(store.amount, transaction.amount);
        storesMap.set(transaction.store, {
          store: transaction.store,
          amount: totalSpent,
          visits: store.visits + 1,
        });
      }
    });

    const stores = [...storesMap.values()];

    // Top stores shopped at the year
    const topStoresShopped = [...stores]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)
      .map((store) => {
        return {
          name: store.store,
          value: dollarFormatter(store.amount),
        };
      });

    // Top stores visited
    const topStoresVisited = [...stores]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)
      .map((store) => {
        return {
          name: store.store,
          value: store.visits,
        };
      });

    return [
      {
        title: "Top Spending Month",
        data: topSpendingMonths,
        emptyMessage: "You somehow haven't spent any money this year!",
      },
      {
        title: "Lowest Spending Month",
        data: lowestSpendingMonths,
        emptyMessage: "You somehow haven't spent any money this year!",
      },
      {
        title: "Top Overspent Month",
        data: topOverspendingMonths,
        emptyMessage: "You haven't overspent during any month! Congrats!",
      },
      {
        title: "Top Fixed Category",
        data: topFixedCategories,
        emptyMessage: "You somehow don't have ANY bills! Good for you!",
      },
      {
        title: "Top Variable Category",
        data: topSpendingCategories,
        emptyMessage: "You somehow haven't spent any money this year!",
      },
      {
        title: "Top Overspent Category",
        data: topOverspendingCategories,
        emptyMessage: "You haven't overspent in any category! Congrats!",
      },
      {
        title: "Top Transaction",
        data: topTransactions,
        emptyMessage: "You somehow haven't spent any money this year!",
      },
      {
        title: "Top Merchant Shopped At",
        data: topStoresShopped,
        emptyMessage: "You somehow haven't shopped anywhere this year!",
      },
      {
        title: "Most Frequented Merchant",
        data: topStoresVisited,
        emptyMessage: "You somehow haven't shopped anywhere this year!",
      },
    ];
  }, [months, categories, transactions]);

  return (
    <Row>
      {insights.map((insight) => (
        <InsightCard key={insight.title} insight={insight} />
      ))}
    </Row>
  );
};

export default SpendingInsightsLayout;
