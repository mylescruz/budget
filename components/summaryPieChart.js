import { VictoryPie } from "victory";

const SummaryPieChart = ({ pieValues, categories }) => {
    let temporaryPieData = [{x: "Your Spending", y: 100}];
    let temporaryPieColors = [["#6c757d"]];

    let pieData = [];
    let colors = [];

    const pieSize = 400;

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
        <>
            {pieValues ?
                <VictoryPie
                    data={pieData} 
                    colorScale={colors}
                    height={pieSize}
                    labelPosition={({ index }) => index
                        ? "centroid"
                        : "startAngle"
                    }
                    style={
                        {
                            labels: {
                                fontSize: 10
                            }
                            
                        }
                    }
                />
                :
                <VictoryPie 
                    data={temporaryPieData} 
                    colorScale={temporaryPieColors}
                    height={pieSize}
                    labelPosition={({ index }) => index
                        ? "centroid"
                        : "startAngle"
                    }
                />
            }
        </>
    );
};

export default SummaryPieChart;