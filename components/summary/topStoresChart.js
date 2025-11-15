import { BarChart, Bar, Tooltip, XAxis, YAxis } from "recharts";

const TopStoresChart = ({ topStores }) => {
  return (
    <BarChart
      style={{
        width: "100%",
        maxWidth: "1000px",
        maxHeight: "70vh",
        aspectRatio: 1.618,
      }}
      responsive
      data={topStores}
    >
      <XAxis dataKey="store" tickLine={true} />
      <YAxis
        width="auto"
        tickLine={true}
        tickFormatter={(value) => `$${(value / 100).toFixed(0)}`}
      />
      <Tooltip formatter={(value) => `$${(value / 100).toFixed(0)}`} />
      <Bar dataKey="amount" fill="#d94412ff" />
    </BarChart>
  );
};

export default TopStoresChart;
