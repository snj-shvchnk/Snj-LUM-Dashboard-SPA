import React from "react";
import { Doughnut } from "react-chartjs-2";
import styles from "./RoundChart.module.css";

class RoundChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // ...this.props
        };
    }

    
    render() {
        const options = { 
            responsive: false,
            aspectRatio: 1,
            maintainAspectRatio: true,
            legend: false,
            cutoutPercentage: 40,
            layout: {
                padding: { top: 20, bottom: 20 },
            },
            ...(this.props.options || {}),
        };
        const { centerCircle, centerCircleLabel, centerCircleCount } = this.props;
        
        // console.log('ChartR', { options });
        return (
            <div className={`${styles.RoundChartContainer} ${this.props.classes || ''}`}>
                    {
                        centerCircle
                        &&
                        <div className={styles.centerCircle}>
                            <div className={styles.centerCircleLabel}>{centerCircleLabel}</div>
                            <div className={styles.centerCircleCount}>{centerCircleCount}</div>
                        </div>
                    }
                    <Doughnut 
                        data={this.props.data} 
                        options={options} 
                        onElementsClick={(elems=[]) => {
                            let [ elem, ] = elems || [];
                            elem = elem || {};
                            const indExist = typeof(elem._index)!=='undefined';
                            const ind =  indExist ? elem._index : null;;
                            // console.log({elems, elem, ind});

                            if (this.props.onChartClick && indExist) {
                                const item = 
                                    this.props.data.dataItems
                                        ? this.props.data.dataItems[ind]
                                        : null;

                                // console.log('onElementsClick', { elem, elems });
                                this.props.onChartClick(
                                    this.props.data.labels[ind],
                                    this.props.data.datasets[0].data[ind],
                                    this.props.data.src,
                                    item,
                                );
                            }
                        }}
                    />
            </div>
        );
    }
}

export default RoundChart;