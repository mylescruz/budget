import { CategoriesContext } from "@/contexts/CategoriesContext";
import { useContext } from "react";
import { VictoryPie } from "victory";

const SummaryPieChart = () => {
    const { categories } = useContext(CategoriesContext);
    
    let pieData = [];
    let colors = [];

    const pieSize = 350;

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
                label: `${category.name} ${percentage}%`
            });

            colors.push(category.color);
        }
    });

    return (
        <svg viewBox="0 -75 450 450">
            <VictoryPie
                standalone={false}
                data={pieData} 
                colorScale={colors}
                height={pieSize}
                labelPosition={"centroid"}
                labelPlacement={"parallel"}
                style={
                    {
                        labels: {
                            fontSize: 8
                        }
                        
                    }
                }
            />
        </svg>
    );
};

export default SummaryPieChart;