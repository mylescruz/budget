import { useMemo, useState } from "react";
import MonthTotalsModal from "./monthTotalsModal";
import TotalsCards from "./totalsCards";
import { Row } from "react-bootstrap";

const TotalsLayout = ({ months, totals }) => {
  const [topic, setTopic] = useState(null);

  const monthData = useMemo(() => {
    return months.map((mth) => {
      let amount;

      switch (topic) {
        case "Income":
          amount = mth.income;
          break;
        case "Expenses":
          amount = mth.actual;
          break;
        case "Net Cash Flow":
          amount = mth.remaining;
          break;
        case "Saved":
          amount = mth.transfers.out;
          break;
        case "Transfers In":
          amount = mth.transfers.in;
          break;
        case "Net Savings":
          amount = mth.transfers.net;
          break;
        case "Budget Inflow":
          amount = mth.income + mth.transfers.in;
          break;
        case "Budget Outflow":
          amount = mth.actual - mth.transfers.out;
          break;
        case "Budget Remaining":
          amount = mth.remaining - mth.transfers.net;
          break;
      }

      return {
        name: mth.name,
        amount: amount,
      };
    });
  }, [topic]);

  // Get the title and description of each modal to display
  const modalDetails = useMemo(() => {
    let title;
    let description;

    switch (topic) {
      case "Income":
        description = "The total net pay from each month";
        break;
      case "Expenses":
        description = "The total amount you spent each month";
        break;
      case "Net Cash Flow":
        description =
          "The total leftover balance between your income and expenses each month";
        break;
      case "Saved":
        description = "The total amount saved each month";
        break;
      case "Transfers In":
        description =
          "The total amount transferred into your budget each month";
        break;
      case "Net Savings":
        description =
          "The total amount transferred to or out of savings each month";
        break;
      case "Budget Inflow":
        description =
          "The total amount of income plus any transfers in for each month";
        break;
      case "Budget Outflow":
        description =
          "The total amount of expenses plus transfers to savings for each month";
        break;
      case "Budget Remaining":
        description =
          "The total leftover balance between the budget's inflow and outflow each month";
        break;
      default:
        description = null;
        break;
    }

    return {
      title: topic,
      description,
    };
  }, [topic]);

  const totalsArray = [
    {
      title: "Budget Inflow",
      amount: totals.income + totals.toChecking,
      textColor: "text-dark",
    },
    {
      title: "Budget Outflow",
      amount: totals.expenses + totals.toSavings,
      textColor: "text-dark",
    },
    {
      title: "Budget Remaining",
      amount: totals.netCashFlow - totals.netSavings,
      textColor:
        totals.netCashFlow - totals.netSavings >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
    },
    {
      title: "Income",
      amount: totals.income,
      textColor: "text-dark",
    },
    {
      title: "Expenses",
      amount: totals.expenses,
      textColor: "text-dark",
    },
    {
      title: "Net Cash Flow",
      amount: totals.netCashFlow,
      textColor:
        totals.netCashFlow >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
    },
    {
      title: "Transfers In",
      amount: totals.toChecking,
      textColor: "text-dark",
    },
    {
      title: "Saved",
      amount: totals.toSavings,
      textColor: "text-dark",
    },
    {
      title: "Net Savings",
      amount: totals.netSavings,
      textColor:
        totals.netSavings >= 0 ? "text-success fw-bold" : "text-danger fw-bold",
    },
  ];

  const chooseTopic = (title) => {
    setTopic(title);
  };

  return (
    <div className="my-4">
      <h5 className="fw-bold">Totals</h5>
      <Row className="d-flex justify-content-center">
        {totalsArray.map((total, index) => (
          <TotalsCards key={index} total={total} chooseTopic={chooseTopic} />
        ))}
      </Row>

      <MonthTotalsModal
        monthData={monthData}
        modalDetails={modalDetails}
        topic={topic}
        setTopic={setTopic}
      />
    </div>
  );
};

export default TotalsLayout;
