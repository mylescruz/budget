import dollarFormatter from "@/helpers/dollarFormatter";
import { useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import dollarsToCents from "@/helpers/dollarsToCents";
import centsToDollars from "@/helpers/centsToDollars";
import MonthTotalsModal from "./monthTotalsModal";

const TotalsCards = ({ summary }) => {
  const [topic, setTopic] = useState(null);

  const chooseTopic = (title) => {
    setTopic(title);
  };

  const monthData = useMemo(() => {
    return summary.months.map((mth) => {
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
      }

      return {
        name: mth.name,
        amount: amount,
      };
    });
  }, [topic]);

  const modalDetails = useMemo(() => {
    switch (topic) {
      case "Income":
        return {
          title: "Income Breakdown",
          description: "The total amount you made each month",
        };
      case "Expenses":
        return {
          title: "Expenses Breakdown",
          description: "The total amount you spent each month",
        };
      case "Net Cash Flow":
        return {
          title: "Net Breakdown",
          description:
            "The total leftover balance between your income and expenses each month",
        };
      case "Saved":
        return {
          title: "Savings Breakdown",
          description: "The total amount saved each month",
        };
      case "Transfers In":
        return {
          title: "Transfers In Breakdown",
          description:
            "The total amount transferred into your budget each month",
        };
      case "Net Savings":
        return {
          title: "Net Savings Breakdown",
          description:
            "The total amount transferred to or out of savings each month",
        };
      default:
        return {
          title: null,
          description: null,
        };
    }
  }, [topic]);

  // Get the totals for income, expenses and transfers
  const rawTotals = summary.months.reduce(
    (sum, month) => {
      sum.income += dollarsToCents(month.income);

      sum.expenses += dollarsToCents(month.actual);

      sum.transfers.in += dollarsToCents(month.transfers.in);

      sum.transfers.out += dollarsToCents(month.transfers.out);

      return sum;
    },
    { income: 0, expenses: 0, transfers: { in: 0, out: 0 } },
  );

  // Get the net cash flow for the year
  const netCashFlow = rawTotals.income - rawTotals.expenses;

  // Get the net savings for the year
  const netSavings = rawTotals.transfers.out - rawTotals.transfers.in;

  const totals = {
    income: centsToDollars(rawTotals.income),
    expenses: centsToDollars(rawTotals.expenses),
    netCashFlow: centsToDollars(netCashFlow),
    toSavings: centsToDollars(rawTotals.transfers.out),
    toChecking: centsToDollars(rawTotals.transfers.in),
    netSavings: centsToDollars(netSavings),
    numMonths: summary.months.length,
  };

  const totalsArray = [
    {
      title: "Income",
      amount: totals.income,
      textColor: "text-dark",
      hasModal: true,
    },
    {
      title: "Expenses",
      amount: totals.expenses,
      textColor: "text-dark",
      hasModal: true,
    },
    {
      title: "Net Cash Flow",
      amount: totals.netCashFlow,
      textColor:
        totals.netCashFlow >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
      hasModal: true,
    },
    {
      title: "Avg Income Per Month",
      amount: totals.income / totals.numMonths,
      textColor: "text-dark",
    },
    {
      title: "Avg Expenses Per Month",
      amount: totals.expenses / totals.numMonths,
      textColor: "text-dark",
    },
    {
      title: "Avg Net Per Month",
      amount: totals.netCashFlow / totals.numMonths,
      textColor:
        totals.netCashFlow >= 0
          ? "text-success fw-bold"
          : "text-danger fw-bold",
    },
    {
      title: "Saved",
      amount: totals.toSavings,
      textColor:
        totals.toSavings > 0 ? "text-success fw-bold" : "text-danger fw-bold",
      hasModal: true,
    },
    {
      title: "Transfers In",
      amount: totals.toChecking,
      textColor:
        totals.toChecking > 0 ? "text-danger fw-bold" : "text-success fw-bold",
      hasModal: true,
    },
    {
      title: "Net Savings",
      amount: totals.netSavings,
      textColor:
        totals.netSavings >= 0 ? "text-success fw-bold" : "text-danger fw-bold",
      hasModal: true,
    },
  ];

  return (
    <>
      <Row className="d-flex justify-content-center">
        {totalsArray.map((total, index) => (
          <Col key={index} className="col-12 col-md-4">
            <div className="bg-white rounded-3 shadow-sm p-3 mb-3 text-center">
              <h6 className="text-muted">{total.title}</h6>
              <h4 className={`fw-bold ${total.textColor}`}>
                {dollarFormatter(total.amount)}
              </h4>
              {total.hasModal && (
                <p
                  className="text-muted small clicker m-0"
                  onClick={() => {
                    chooseTopic(total.title);
                  }}
                >
                  Per Month Breakdown <i className="bi bi-arrow-right small" />
                </p>
              )}
            </div>
          </Col>
        ))}
      </Row>

      <MonthTotalsModal
        monthData={monthData}
        modalDetails={modalDetails}
        topic={topic}
        setTopic={setTopic}
      />
    </>
  );
};

export default TotalsCards;
