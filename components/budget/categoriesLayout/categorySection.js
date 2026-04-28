import { Row } from "react-bootstrap";
import CategoryCard from "./categoryCard";

const CategorySection = ({ title, categories, onEdit }) => {
  return (
    <div className="mb-4">
      <h6 className="text-muted mb-2">{title}</h6>

      <Row>
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onEdit={onEdit}
          />
        ))}
      </Row>
    </div>
  );
};

export default CategorySection;
