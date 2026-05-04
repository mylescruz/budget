import { BudgetContext } from "@/contexts/BudgetContext";
import { useContext, useState } from "react";
import CategorySection from "./categorySection";
import { Button } from "react-bootstrap";
import CategoryPieChart from "@/components/categoriesCharts/categoryPieChart";
import AddCategoryModal from "./addCategoryModal/addCategoryModal";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ConfirmDeleteCategoryModal from "./editCategoryModal/confirmDeleteCategoryModal";

const CategoriesLayout = ({ dateInfo }) => {
  const { categories } = useContext(BudgetContext);

  const [modal, setModal] = useState(null);
  const [editedCategory, setEditedCategory] = useState({});
  const [showPie, setShowPie] = useState(false);

  const onEdit = (category) => {
    setEditedCategory({
      ...category,
      currentName: category.name,
      currentBudget: category.budget,
    });

    setModal("EDIT");
  };

  const togglePie = () => {
    setShowPie((prev) => !prev);
  };

  const fixedCategories = categories.filter((category) => category.fixed);
  const variableCategories = categories.filter((category) => !category.fixed);

  return (
    <>
      {showPie && <CategoryPieChart categories={categories} />}

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">
          Categories Breakdown{" "}
          <i
            className={`clicker small bi ${showPie ? "bi-chevron-up" : "bi-chevron-down"}`}
            onClick={togglePie}
          />
        </h5>
        <Button size="sm" onClick={() => setModal("ADD")}>
          Add Category
        </Button>
      </div>

      <CategorySection
        title={"Fixed"}
        categories={fixedCategories}
        onEdit={onEdit}
      />
      <CategorySection
        title={"Variable"}
        categories={variableCategories}
        onEdit={onEdit}
      />

      {modal === "ADD" && (
        <AddCategoryModal
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "EDIT" && (
        <EditCategoryModal
          editedCategory={editedCategory}
          setEditedCategory={setEditedCategory}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "DELETE" && (
        <ConfirmDeleteCategoryModal
          editedCategory={editedCategory}
          modal={modal}
          setModal={setModal}
        />
      )}
    </>
  );
};

export default CategoriesLayout;
