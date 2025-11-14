import { BarChart, Bar, Tooltip, XAxis, YAxis, LabelList } from "recharts";

const MonthsChart = ({ months }) => {
  const data = [
    { name: "Highest", month: months.max.monthName, amount: months.max.amount },
    { name: "Lowest", month: months.min.monthName, amount: months.min.amount },
    { name: "Average", month: "", amount: months.avg },
  ];

  const formatDollars = (cents) => `$${(cents / 100).toLocaleString()}`;

  return (
    <BarChart
      style={{
        width: "100%",
        maxWidth: "1000px",
        maxHeight: "70vh",
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
    >
      <XAxis dataKey="name" />
      <YAxis tickFormatter={formatDollars} />
      <Tooltip
        formatter={(value) => formatDollars(value)}
        labelFormatter={(label) =>
          `${label} Month: ${data.find((d) => d.name === label).month}`
        }
      />
      <Bar dataKey="amount" fill="#0c87c5ff">
        <LabelList dataKey="amount" formatter={formatDollars} position="top" />
      </Bar>
    </BarChart>
  );
};

export default MonthsChart;
