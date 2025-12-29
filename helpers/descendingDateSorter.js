// Sorts the dates in an array from earliest to latest
export default function descendingDateSorter(givenArray) {
  return givenArray.sort((a, b) => new Date(b.date) - new Date(a.date));
}
