import React from "react";
import styles from './ChartInterventions.module.css';

class ChartInterventions extends React.Component {
    constructor(props) {
        super(props);
        const { _pi } = this;
        this.canvas_width = 286;
	    this.canvas_height = 286;
	    this.canvas_cx = 143;
	    this.canvas_cy = 143;
	    this.canvas_offset_left = 0;
	    this.canvas_offset_top = 0;

	    this.null_angle = _pi(1.5);
	    this.full_angle = _pi(2);

	    this.background_radius = 140;
	    this.background_color = '#edeeef';
        this.primary_radius = 105;
        
        this.totals = {
            radius: 70,
            backgrund: '#fff',
            count_size: 42,
            title_size: 12,
            color: '#5F6972',
            text: 'Total Interventions',
        };

	    this.delta_step = 10;
	    this.chart_gap = 5;

        this.canvas = null;
        this.context = null;

        this.data = props.data || {};
    }

    componentDidMount() {
        this.initChart();
    };

    initChart = () => {
        this.context = this.canvas.getContext('2d');
        this.drawChart();
        setTimeout(() => {
            this.chartContainer.style.opacity = 1;
            this.chartContainer.style.transform = 'scale(1)';
        }, 50);
    };

    _pi = (n = 1) => (Math.PI * n);

    scaleCanvas = (canvas, context, width, height) => {
        // assume the device pixel ratio is 1 if the browser doesn't specify it
        const devicePixelRatio = window.devicePixelRatio || 1;
      
        // determine the 'backing store ratio' of the canvas context
        const backingStoreRatio = (
          context.webkitBackingStorePixelRatio ||
          context.mozBackingStorePixelRatio ||
          context.msBackingStorePixelRatio ||
          context.oBackingStorePixelRatio ||
          context.backingStorePixelRatio || 1
        );
      
        // determine the actual ratio we want to draw at
        const ratio = devicePixelRatio / backingStoreRatio;
      
        if (devicePixelRatio !== backingStoreRatio) {
            // set the 'real' canvas size to the higher width/height
            canvas.width = width * ratio;
            canvas.height = height * ratio;

            // ...then scale it back down with CSS
            canvas.style.width = width + 'px';
            // canvas.style.height = height + 'px';
        } else {
            // this is a normal 1:1 device; just scale it simply
            canvas.width = width;
            // canvas.height = height;
            canvas.style.width = '';
            // canvas.style.height = '';
        }
      
        // scale the drawing context so everything will work at the higher ratio
        context.scale(ratio, ratio);
    };

    drawBorder = (item) => {
        if (!item) return;
        const { context, canvas_cx, canvas_cy } = this;
		const { radius, start_angle, end_angle, borderColor } = item;
		const borderRadius = radius + 2.5;
		// console.log('drawBorder', { item });
		
    	// context.moveTo(canvas_cx, canvas_cy);
    	context.strokeStyle = borderColor;
        context.lineWidth = 5;

		const canvas_cx_xx = canvas_cx + (borderRadius * Math.cos(start_angle));
		const canvas_cy_yy = canvas_cy + (borderRadius * Math.sin(start_angle));

        // context.beginPath();
        context.moveTo(canvas_cx, canvas_cy);
        context.lineTo(canvas_cx_xx, canvas_cy_yy); // Рисует линию до точки на окружности
		context.arc(canvas_cx, canvas_cy, borderRadius, start_angle, end_angle);
        context.stroke();
        context.lineTo(canvas_cx, canvas_cy);
        context.stroke();
        context.closePath();
    };

    drawInnerShadow = ({ radius, start_angle, end_angle, inner_shadow }) => {
        const { context, canvas_cx, canvas_cy } = this;
        console.log('drawInnerShadow', { radius, start_angle, end_angle, inner_shadow });

        context.save();
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.shadowColor = 'black';
        context.shadowBlur = 18;
        //
        context.beginPath();
        context.arc(canvas_cx, canvas_cy, radius, start_angle, end_angle);
        context.lineTo(canvas_cx, canvas_cy);
        context.clip();
        context.stroke();
        //
        context.shadowColor = inner_shadow;
        context.shadowBlur = 4;
        context.shadowOffsetY = 0;
        context.stroke();
        //
        context.restore();
    };

    drawSeparator = (item) => {
        const { context, canvas_cx, canvas_cy, background_radius, background_color } = this;
    	context.beginPath(); // Начинает новый путь
        context.moveTo(canvas_cx, canvas_cy); // Рередвигает перо в центр уруга

        // const canvas_cx_xx = canvas_cx + (background_radius * Math.cos(item.end_angle));
        // const canvas_cy_yy = canvas_cy + (background_radius * Math.sin(item.end_angle));
        const { x, y } = 
            this.locatePoint(
                background_radius, 
                item.end_angle, 
                canvas_cx
            );
        
        context.lineTo(x, y); // Рисует линию до точки на окружности
        context.strokeStyle = '#0f0';
        context.lineWidth = 20;
        context.stroke();
        context.closePath();
    };

    locatePoint = (destination, angle, x0, y0) => ({
        x: x0 + (destination * Math.cos(angle)),
        y: y0 + (destination * Math.sin(angle)),
    });

    drawItem = (item, selectionHiglight) => {
        // console.log('drawItem', { item });
        const { context, canvas_cx, canvas_cy, selection } = this;
        const { radius, start_angle, end_angle, color, hoverColor } = item;

        // let segment = new Path2D();
        // segment.arc(canvas_cx, canvas_cy, radius / 2, start_angle, end_angle);
        // segment.lineWidth = radius;
        // segment.fillStyle = color;
        // context.stroke(segment);
        // console.log({ segment });
        // return segment;
        context.beginPath();
        const arc = context.arc(canvas_cx, canvas_cy, radius / 2, start_angle, end_angle);
        context.strokeStyle = 
            selectionHiglight 
                ?
                item.activeSegment 
                    ? color 
                    : selection 
                        ? hoverColor 
                        : color
                :
                color;

        context.lineWidth = radius;
        context.stroke();
        context.closePath();
    };

    drawAll = () => {
        const { data } = this;
        const { context, canvas_width, canvas_height, drawBorder, drawItem, _pi,
                background_radius, background_color, null_angle, full_angle, 
                primary_radius, delta_step, drawSeparator, drawLegend,
         } = this;

        context.beginPath();
        context.fillStyle = data.background;
        context.fillRect(0, 0, canvas_width, canvas_height);
        context.closePath();

        // draw bg gray circle
        const background_circle = {
            start_angle: 0,
            end_angle: _pi(2),
            width: background_radius,
            radius: background_radius,
            color: background_color,
        };
        drawItem(background_circle);

        
        // compute items position
        // console.log('draw segments', { data, context });
        const { selection } = this.props;
        let cursor = null_angle;
        data.items.forEach((item, index, entity) => {
            item.activeSegment = (selection && selection.id === item.id);
            item.perc = item.count / data.total;
            item.angle = full_angle * item.perc;

            item.radius = 
                item.activeSegment 
                    ? (background_radius - 5)
                    : primary_radius + ((item.priority - 1) * delta_step);

            item.start_angle = cursor;
            item.end_angle = (cursor + item.angle);
            cursor += item.angle;
        });

        // draw segments

        data.items.forEach((item, index) => {
            item.color = item.primaryColor || item.color;
            item.colorDisabled = item.colorFiltered;
            // remember active elements
            item.segment = this.drawItem(item, true);
        });

        // draw legend
        data.items.forEach(drawLegend);

        // draw separators
        // data.items.forEach((item, index) => {
        //     this.drawSeparator(item);
        // });

        // draw shadows
        data.items.forEach((item, index) => {
            this.drawInnerShadow(item);
        });

        // this.drawBorder(data.items.filter(f => f.activeSegment)[0]);

        this.drawTotals();
    };

    drawTotals = () => {
        const { canvas, context, canvas_cx, canvas_cy, totals, _pi} = this;
        context.save();
        context.shadowColor = "rgba(0, 0, 0, 0.25)";
        context.shadowBlur = 20;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 2;
        this.drawItem({
            start_angle: 0,
            end_angle: _pi(2),
            width: totals.radius,
            radius: totals.radius,
            color: totals.backgrund,
        });
        context.restore();
        this.drawTotalValues();
    };

    drawChart = () => {
        const { canvas, context, canvas_width, canvas_height, drawAll } = this;
        console.log({ canvas, context, canvas_width, canvas_height, drawAll });

    	this.scaleCanvas(canvas, context, 286, 286);
	    this.canvas_cx = Math.round(canvas_width / 2);
	    this.canvas_cy = Math.round(canvas_height / 2);
	    drawAll();
    };

    drawTotalValues = () => {
        const { canvas, context, canvas_width, canvas_height, canvas_cx, canvas_cy, totals } = this;
        
        context.font = "42px Rubik";
        context.fontWeight = '300';
        context.fillStyle = "#5F6972";
        context.textAlign = "center";
        context.fillText(this.data.total, canvas_cx, canvas_cy);

        context.font = "12px Rubik";
        context.fontWeight = '300';
        context.fillStyle = "#5F6972";
        context.textAlign = "center";
        context.fillText(this.data.title.split(' ')[0], canvas_cx, canvas_cy + 18);
        context.fillText(this.data.title.split(' ')[1], canvas_cx, canvas_cy + 30);
    }

    drawLegend = (item, index) => {
        const { context, canvas_cx, canvas_cy, _pi, totals } = this;
        const { radius, start_angle, end_angle, color, angle } = item;
        
        // define legend position
        const mid_angle = start_angle + (angle / 2);
        const mid_radius = Math.round(
            totals.radius + (Math.abs(radius - totals.radius) / 2)
        );

        // Legend center
        const { x, y } = this.locatePoint(mid_radius, mid_angle, canvas_cx, canvas_cy);
        // console.log('drawLegend', { item, index, mid_angle, mid_radius, x, y });
        context.beginPath();
        context.fillStyle = "#fff";
        context.strokeStyle = "#fff";
        context.arc(x, y, 11, 0, _pi(2));
        context.fill();
        context.lineWidth = 1;
        context.stroke();
        context.closePath();

        // Legend value
        context.font = "14px Rubik";
        context.fontWeight = '400';
        context.lineHeight = '22';
        context.fillStyle = "#5F6972";
        context.textAlign = "center";
        context.fillText(item.count, x, y+5);
        context.stroke();
    };

    handleCanvasMouseMove = (event) => {
        const { context, data } = this;
        // console.log('canvas mouse moving', { event, context, data })
        // data.items.forEach((item, index) => {
        //     if (item.segment) {
        //         if (context.isPointInPath(item.segment, event.offsetX, event.offsetY)) 
        //         {
        //             // console.log('HIT!', { item });
        //         }
        //         else {
        //         }
        //     }
        // });
    }

    render () {
        const { selection } = this.props;
        console.log('Render cart...', { selection });

        if (selection != this.selection) {
            this.selection = selection;
            setTimeout(() => this.initChart(), 20);
        }

        return (
            <div 
                ref={(el) => { this.chartContainer = el; }}
                className={styles.mainChartHolder} 
                style={{ opacity: 0, transform: 'scale(0)' }}
            >
                {/* <div>{this.props.selection?.title}</div> */}
                <canvas 
                    ref={(el) => { this.canvas = el; }}
                    className={styles.mainChartCanvas} 
                    width="286" 
                    height="286"
                    onMouseMove={this.handleCanvasMouseMove}
                />
            </div>
        )
    }
}

export default ChartInterventions;