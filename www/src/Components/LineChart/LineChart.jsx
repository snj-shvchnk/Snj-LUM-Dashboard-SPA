import React from "react";
import { Line } from "react-chartjs-2";
import styles from "./LineChart.module.css";

class LineChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataLine: {
                labels: ["1 Jul", "4 Jul", "7 Jul", "10 Jul", "14 Jul", "17 Jul", "21 Jul", "25 Jul", "29 Jul", "today"],
                datasets: [
                    {
                        fill: true,
                        lineTension: 0.3,
                        backgroundColor: "#06CF9622",
                        borderColor: "#06CF96",
                        borderCapStyle: "butt",
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: "miter",
                        pointBorderColor: "#06CF96",
                        pointBackgroundColor: "rgb(255, 255, 255)",
                        pointBorderWidth: 10,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgb(0, 0, 0)",
                        pointHoverBorderColor: "rgba(220, 220, 220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 0,
                        pointHitRadius: 0,
                        data: [ 65, 59, 100, 80, 81, 56, 55, 40, 65, 59]
                    }
                ]
            }
        };
    }

    render() {
        return (<div className={styles.lineChartHolder}>
            <Line 
                data={this.state.dataLine} 
                options={{ 
                    responsive: true, 
                    legend: false,
                }}
                style={{ marginBottom: '20px' }}
            />
        </div>);
    }
}

export default LineChart;