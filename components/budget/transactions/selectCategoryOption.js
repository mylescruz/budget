const SelectCategoryOption = ({ category }) => {
  return (
    <>
      {category.subcategories.length > 0 ? (
        <optgroup label={category.name}>
          {category.subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.name}>
              {subcategory.name}
            </option>
          ))}
        </optgroup>
      ) : (
        <option key={category._id} value={category.name}>
          {category.name}
        </option>
      )}
    </>
  );
};

export default SelectCategoryOption;
