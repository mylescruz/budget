const SelectCategory = ({ category }) => {
    const hasSubcategory = category.hasSubcategory;

    return (
        <>
            {hasSubcategory ? 
                <optgroup label={category.name}>
                    {category.subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.name}>{subcategory.name}</option>
                    ))}
                </optgroup>
                :
                <option key={category.id} value={category.name}>{category.name}</option>
            }
        </>
    );
};

export default SelectCategory;