// Sorts the categories based on their actual values
export default function categorySorter(givenArray) {
  return givenArray.sort((a, b) => b.actual - a.actual);
}
