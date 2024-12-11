const categorySorter = (givenArray) => {
    givenArray.sort((a,b) => {
        if (a.budget < b.budget)
            return 1;
        else if (a.budget > b.budget)
            return -1;
        else
            return 0;
    });

    return givenArray;
};

export default categorySorter;