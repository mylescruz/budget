// Sorts the dates in an array from earliest to latest
export default function ascendingDateSorter(givenArray) {
  return givenArray.sort((a, b) => new Date(a.date) - new Date(b.date));
}
