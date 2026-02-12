import { useState } from "react";
import CategoryTable from "./categoryTable/categoryTable";
import AddCategoryModal from "./addCategoryModal";
import EditCategoryModal from "./editCategoryModal/editCategoryModal";
import ConfirmDeleteCategoryModal from "./editCategoryModal/confirmDeleteCategoryModal";

const CategoryTableLayout = ({ dateInfo }) => {
  const [modal, setModal] = useState("none");
  const [editedCategory, setEditedCategory] = useState({});

  return (
    <>
      <CategoryTable
        dateInfo={dateInfo}
        setEditedCategory={setEditedCategory}
        setModal={setModal}
      />

      {modal === "add" && (
        <AddCategoryModal
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "edit" && (
        <EditCategoryModal
          editedCategory={editedCategory}
          setEditedCategory={setEditedCategory}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}

      {modal === "delete" && (
        <ConfirmDeleteCategoryModal
          editedCategory={editedCategory}
          dateInfo={dateInfo}
          modal={modal}
          setModal={setModal}
        />
      )}
    </>
  );
};

export default CategoryTableLayout;
