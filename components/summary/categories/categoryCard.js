import dollarFormatter from "@/helpers/dollarFormatter";
import { useState } from "react";
import { Col } from "react-bootstrap";
import SubcategoriesSection from "./subcategoriesCard";

const CategoryCard = ({ category }) => {
  const [expanded, setExpanded] = useState(false);

  const isFixed = category.fixed;
  const isOver = category.actual > category.budget;
  const hasSubcategory = category.subcategories.length > 0;

  const remaining = category.budget - category.actual;

  let percent = Math.min(
    100,
    Math.round((category.actual / category.budget) * 100),
  );

  if (category.budget <= 0) {
    percent = 100;
  }

  const percentText = `${percent}%`;

  let percentColor = "text-muted";

  if (category.budget <= 0 || category.actual > category.budget) {
    percentColor = "text-danger";
  }

  const numMonths = `${category.totalMonths} ${category.totalMonths > 1 ? "months" : "month"}`;

  return (
    <Col xs={12} lg={6} className="my-2">
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3">
        {/* TOP ROW */}
        <div className="d-flex justify-content-between align-items-start">
          <div className="d-flex align-items-center gap-2">
            {/* Color Dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: category.color,
              }}
            />

            <div>
              <div className="fw-semibold">
                {category.name}{" "}
                {hasSubcategory && (
                  <i
                    className={`clicker small bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`}
                    onClick={() => setExpanded((prev) => !prev)}
                  />
                )}
              </div>
              <div className="text-muted small">
                {dollarFormatter(category.actual)} /{" "}
                <span
                  className={
                    category.budget <= 0
                      ? "text-danger fw-semibold"
                      : "text-muted"
                  }
                >
                  {dollarFormatter(category.budget)}
                </span>{" "}
                <span className={isOver ? "text-danger fw-semibold" : ""}>
                  (
                  {isOver
                    ? "Over budget"
                    : `${dollarFormatter(remaining)} left`}
                  )
                </span>
              </div>
            </div>
          </div>

          {/* ACTION */}
          <div className="d-flex flex-column align-items-end">
            <div className="small text-muted">
              {dollarFormatter(category.actual / category.totalMonths)} / month
            </div>
            <div className="small text-muted">{numMonths}</div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-2">
          <div className="progress" style={{ height: 6 }}>
            <div
              className={`progress-bar ${
                isFixed
                  ? "bg-success"
                  : isOver
                    ? "bg-danger"
                    : percent > 90
                      ? "bg-warning"
                      : "bg-success"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {expanded && category.subcategories.length > 0 && (
          <div className="mt-2 ps-3">
            {category.subcategories
              .sort((a, b) => {
                if (isFixed) {
                  return a.dueDate - b.dueDate;
                } else {
                  return b.actual - a.actual;
                }
              })
              .map((subcategory) => (
                <SubcategoriesSection
                  key={subcategory.name}
                  subcategory={subcategory}
                />
              ))}
          </div>
        )}
      </div>
    </Col>
  );
};

export default CategoryCard;
