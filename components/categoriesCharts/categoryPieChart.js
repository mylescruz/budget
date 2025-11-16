import { Container } from "react-bootstrap";
import { Cell, Pie, PieChart } from "recharts";

const customLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ fontSize: "14px", fontWeight: 500 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CategoryPieChart = ({ categories }) => {
  return (
    <Container className="d-flex flex-column align-items-center">
      <h4 className="text-center">Spending by Category</h4>
      <PieChart
        style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "80vh",
          aspectRatio: 1,
        }}
        responsive
      >
        <Pie
          data={categories}
          labelLine={false}
          label={customLabel}
          dataKey="actual"
        >
          {categories.map((category) => (
            <Cell key={category.name} fill={category.color} />
          ))}
        </Pie>
      </PieChart>
    </Container>
  );
};

export default CategoryPieChart;
