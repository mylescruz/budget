import dayFormatter from "@/helpers/dayFormatter";
import dollarFormatter from "@/helpers/dollarFormatter";
import getDueDateDisplay from "@/helpers/getDueDateDisplay";
import { useState } from "react";
import SubcategoriesSection from "./subcategoriesSection";
import { Col } from "react-bootstrap";

const CategoryCard = ({ category, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  const percent = Math.min(
    100,
    Math.round((category.actual / category.budget) * 100),
  );

  const hasSubcategory = category.subcategories.length > 0;

  const isFixed = category.fixed;
  const remaining = category.budget - category.actual;
  const isOver = remaining < 0;

  const dueInfo = getDueDateDisplay(category);

  return (
    <Col xs={12} lg={6} className="my-2">
      <div className="h-100 bg-white rounded-3 shadow-sm p-3 mb-3">
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
                {dollarFormatter(category.budget)}{" "}
                <span className="text-muted">({percent}%)</span>
              </div>
            </div>
          </div>

          {/* ACTION */}
          <div className="d-flex flex-column align-items-end">
            <span className="clicker" onClick={() => onEdit(category)}>
              &#8942;
            </span>
            <div className="small">
              <span className={isOver ? "text-danger fw-semibold" : ""}>
                {isOver ? "Over budget" : `${dollarFormatter(remaining)} left`}
              </span>
            </div>
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

        {/* FOOTER */}
        {dueInfo && (
          <div className="mt-1 small text-muted">
            {dueInfo.type === "single" && (
              <>
                {dueInfo.text} {dayFormatter(dueInfo.date)}
              </>
            )}

            {dueInfo.type === "next" && (
              <>Next charge on the {dayFormatter(dueInfo.date)}</>
            )}
          </div>
        )}

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
                  key={subcategory._id}
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
