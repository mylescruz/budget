// Sorts the months in an array

const historySorter = (givenArray) => {
  givenArray.sort((a, b) => {
    const dateA = new Date(`${a.month} 01, ${a.year}`);
    const dateB = new Date(`${b.month} 01, ${b.year}`);

    if (dateA > dateB) {
      return 1;
    } else if (dateA < dateB) {
      return -1;
    } else {
      return 0;
    }
  });

  return givenArray;
};

export default historySorter;
