const CategoryBadge = ({ name, color }) => {
  const badgeStyle = {
    backgroundColor: color,
    border: color,
  };

  const formattedName = name.length < 14 ? name : name.slice(0, 14) + "...";

  return (
    <span style={badgeStyle} className="badge fw-bold fs-6 text-white">
      {formattedName}
    </span>
  );
};

export default CategoryBadge;
