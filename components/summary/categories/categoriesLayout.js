import CategoryPieChart from "@/components/categoriesCharts/categoryPieChart";
import { useState } from "react";
import { Row } from "react-bootstrap";
import CategoryCard from "./categoryCard";

const CategoriesLayout = ({ categories }) => {
  const [showPie, setShowPie] = useState(false);

  const fixedCategories = categories.filter((category) => category.fixed);
  const variableCategories = categories.filter((category) => !category.fixed);

  return (
    <div className="my-4">
      <h5 className="fw-bold">
        Categories{" "}
        <i
          className={`bi ${showPie ? "bi-chevron-up" : "bi-chevron-down"}`}
          onClick={() => setShowPie((prev) => !prev)}
        />
      </h5>
      {showPie && <CategoryPieChart categories={categories} />}
      <Row>
        <h6 className="text-muted">Fixed</h6>
        {fixedCategories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </Row>
      <Row>
        <h6 className="text-muted">Variable</h6>
        {variableCategories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </Row>
    </div>
  );
};

export default CategoriesLayout;
