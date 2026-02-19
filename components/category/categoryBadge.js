const CategoryBadge = ({ name, color }) => {
  const badgeStyle = {
    backgroundColor: color,
    border: color,
  };

  const xsName = name.length > 13 ? name.slice(0, 10) + "..." : name;
  const smName = name.length > 20 ? name.slice(0, 17) + "..." : name;
  const mdName = name.length > 16 ? name.slice(0, 13) + "..." : name;
  const lgName = name.length > 18 ? name.slice(0, 15) + "..." : name;
  const xlName = name.length > 15 ? name.slice(0, 12) + "..." : name;

  return (
    <span style={badgeStyle} className="badge fw-bold fs-6 text-white">
      <span className="d-sm-none">{xsName}</span>
      <span className="d-none d-sm-block d-md-none">{smName}</span>
      <span className="d-none d-md-block d-lg-none">{mdName}</span>
      <span className="d-none d-lg-block d-xl-none">{lgName}</span>
      <span className="d-none d-xl-block">{xlName}</span>
    </span>
  );
};

export default CategoryBadge;
