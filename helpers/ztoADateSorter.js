// Sorts the dates backwards in an array

const zToADateSorter = (givenArray) => {
  givenArray.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });

  return givenArray;
};

export default zToADateSorter;
