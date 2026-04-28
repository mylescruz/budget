const getDueDateDisplay = (category) => {
  if (!category.fixed) {
    return null;
  }

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // No subcategories → direct due date
  if (!category.subcategories?.length) {
    const display = {
      type: "single",
      date: category.dueDate,
    };

    const date = new Date(year, month, category.dueDate);

    if (date <= today) {
      display.text = "Charged on the";
    } else {
      display.text = "Due on the";
    }

    return display;
  }

  // Has subcategories → find next due date
  const upcoming = category.subcategories
    .filter((subcategory) => {
      const date = new Date(year, month, subcategory.dueDate);

      return date >= today;
    })
    .sort((a, b) => a.dueDate - b.dueDate)[0];

  if (upcoming) {
    return {
      type: "next",
      date: upcoming.dueDate,
      count: category.subcategories.length,
    };
  }

  return {
    type: "none",
  };
};

export default getDueDateDisplay;
