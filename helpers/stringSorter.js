// Sorts the array by the given field and order
export default function stringSorter(givenArray, field, order) {
  if (order.toLowerCase() === "asc") {
    return [...givenArray].sort((a, b) => {
      if (a[field].slice(0, 1) >= b[field].slice(0, 1)) {
        return 1;
      } else {
        return -1;
      }
    });
  } else {
    return [...givenArray].sort((a, b) => {
      if (a[field].slice(0, 1) <= b[field].slice(0, 1)) {
        return 1;
      } else {
        return -1;
      }
    });
  }
}
