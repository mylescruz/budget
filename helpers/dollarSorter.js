// Sorts the array by the given field and order
export default function dollarSorter(givenArray, field, order) {
  if (order.toLowerCase() === "asc") {
    return [...givenArray].sort((a, b) => a[field] - b[field]);
  } else {
    return [...givenArray].sort((a, b) => b[field] - a[field]);
  }
}
