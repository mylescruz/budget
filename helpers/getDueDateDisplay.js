const getDueDateDisplay = (category, budgetDateInfo) => {
  if (!category.fixed) {
    return null;
  }

  const today = new Date();

  // No subcategories → direct due date
  if (!category.subcategories?.length) {
    const display = {
      type: "single",
      name: category.name,
      date: category.dueDate,
    };

    const categoryDate = new Date(
      budgetDateInfo.year,
      budgetDateInfo.month - 1,
      category.dueDate,
    );

    if (categoryDate <= today) {
      display.text = "Charged on the";
    } else {
      display.text = "Due on the";
    }

    return display;
  }

  // Has subcategories → find next due date
  const upcoming = category.subcategories
    .filter((subcategory) => {
      const date = new Date(
        budgetDateInfo.year,
        budgetDateInfo.month - 1,
        subcategory.dueDate,
      );

      return date >= today;
    })
    .sort((a, b) => a.dueDate - b.dueDate)[0];

  if (upcoming) {
    return {
      type: "next",
      name: upcoming.name,
      date: upcoming.dueDate,
      count: category.subcategories.length,
    };
  }

  return {
    type: "none",
  };
};

export default getDueDateDisplay;
