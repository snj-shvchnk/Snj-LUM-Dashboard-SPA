import React from "react";
import styles from './ChartInterventionsSvg.module.css';
import * as d3 from "d3";

const _pi = (n = 1) => (Math.PI * n);

const animDuration = 600;

class ChartInterventionsSvg extends React.Component {
    constructor(props) {
        super(props);
        this.canvas = null;
        this.canvas_id = props.id;
        this.canvas_width = 286;
	    this.canvas_height = 286;
	    this.canvas_cx = 143;
	    this.canvas_cy = 143;
	    
	    this.null_angle = _pi(1.5);
	    this.full_angle = _pi(2);

	    this.background_radius = 125;
	    this.background_color = '#edeeef';
        this.primary_radius = 105;
	    this.delta_step = 10;
	    this.chart_gap = 5;
        
        this.totals = {
            radius: 70,
            backgrund: '#fff',
            count_size: 42,
            title_size: 12,
            color: '#5F6972',
            text: 'Total Interventions',
        };

        this.state = {
            chartType: 'round',
        };

        this.canvas = null;
        this.context = null;

        this.data = props.data || {};
    }

    componentDidMount() {
        // AJAX...
        this.data = 
            this.props.data?.items
            ||
            [12, 5, 6, 6, 9, 10];

        this.initChart();
        this.drawChart(this.data);
    };

    initChart = () => {
        const { props, canvas_width, canvas_height, canvas_id,  } = this;
        this.canvas_width = props.width || canvas_width;
        this.canvas_height = props.height || canvas_height;
        this.canvas_cx = Math.round(this.canvas_width / 2);
        this.canvas_cy = Math.round(this.canvas_height / 2);

        this.canvas = 
            d3.select(`#${canvas_id}`)
                .append("svg")
                .attr("width", this.canvas_width)
                .attr("height", this.canvas_height);

        console.log({ canvas: this.canvas });
    };


    drawChart = (data) => {
        console.log('drawChart', { ...this.state, data });
        if (this.state.chartType === 'lines') return this.drawChartLine(data);
        if (this.state.chartType === 'round') return this.drawChartRound(data);
    };

    drawChartRound = (data) => {
        const { 
            canvas, canvas_width, canvas_height, chart_gap,
            handleMouseOver, handleMouseOut, handleClick,
        } = this;
        console.log('drawChartLine', { data, ...this });

        const w1 = ((canvas_width + chart_gap) / data.length) - chart_gap;
        canvas.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * (w1 + chart_gap))
            .attr("y", (d, i) => canvas_height - (10 * d.count))
            .attr("width", w1)
            .attr("height", (d, i) => d.count * 10)
            .attr("fill", (d, i) => d.hoverColor)
            .on("click", handleClick)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
    };

    drawChartLine = (data) => {
        const { 
            canvas, canvas_width, canvas_height, chart_gap,
            handleMouseOver, handleMouseOut, handleClick,
        } = this;
        console.log('drawChartLine', { data, ...this });

        const w1 = ((canvas_width + chart_gap) / data.length) - chart_gap;
        canvas.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * (w1 + chart_gap))
            .attr("y", (d, i) => canvas_height - (10 * d.count))
            .attr("width", w1)
            .attr("height", (d, i) => d.count * 10)
            .attr("fill", (d, i) => d.hoverColor)
            .on("click", handleClick)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
    };

    handleMouseOver = function (d, i) {
        console.log('mOver', {d, i, t: this});
        this.style.fill = i.color;
    };

    handleMouseOut = function (d, i) {
        console.log('mOut', {d, i, t: this});
        if (!this.classList.contains('selected')) {
            this.style.fill = i.hoverColor;
        }
    };

    handleClick = function (d, i) {
        console.log('mClk', {d, i, t: this});
        this.style.fill = i.color;
        this.classList.toggle('selected');
        if (!this.classList.contains('selected')) {
            this.style.fill = i.hoverColor;
        }
    };

    render () {
        const { props, canvas_id } = this;
        console.log('Render cart...', { props });

        return (
                <div 
                    id={canvas_id} 
                    ref={(el) => { this.canvas = el; }}
                    className={styles.mainChartCanvas} 
                />
        );
    }
}

export default ChartInterventionsSvg;