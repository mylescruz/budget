// Uses the Victory, 3rd Party Library, to display a Pie Chart of the percentages spent on each category
import { VictoryPie } from "victory";

const CategoryPieChart = ({ categories }) => {    
    let pieData = [];
    let colors = [];

    const pieSize = 350;

    const pieSVG = "0 -25 400 400";

    const totalActual = categories.reduce((sum, category) => sum + category.actual, 0);

    categories.map(category => {
        let percentage = 0;
        const actualFraction = category.actual / totalActual;
        
        if (actualFraction > 0.95)
            percentage = Math.round(Math.floor(actualFraction * 100));
        else if (actualFraction < 0.01)
            percentage = (actualFraction * 100).toFixed(2);
        else
            percentage = Math.round(actualFraction.toFixed(2) * 100);

        if (percentage > 0) {
            pieData.push({
                x: category.name,
                y: category.actual,
                label: `${percentage}%`
            });

            colors.push(category.color);
        }
    });

    return (
        <svg viewBox={pieSVG}>
            <VictoryPie
                standalone={false}
                data={pieData} 
                colorScale={colors}
                height={pieSize}
                labelPosition={"centroid"}
                labelPlacement={"vertical"}
                style={
                    {
                        labels: {
                            fontSize: 12
                        }
                        
                    }
                }
            />
        </svg>
    );
};

export default CategoryPieChart;