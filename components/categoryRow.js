const CategoryRow = ({ category }) => {
    const difference = category.budget - category.actual;

    return (
        <tr>
            <th scope="row">{category.name}</th>
            <td>{category.budget}</td>
            <td>{category.actual}</td>
            <td>{difference}</td>
        </tr>
    );
};

export default CategoryRow;