import React from 'react'
import './ChartDailyActive.css'
import ApexCharts from 'apexcharts';
import ReactApexChart from "react-apexcharts";
import icons from '../icons';
// import { data } from './data';

class ChartDailyActive extends React.Component {
  constructor(props) {
    super(props);

    // console.log('ChartDailyActive', { props });

    this.state = {
      textlabel: "mm Hg",
      series: [{ data: props.data, name: "%" }],
      options: {
        colors: ['#00AE8B'],
        grid: {
          show: true,
          borderColor: '#f7f7f7',
          strokeDashArray: 0,
          position: 'back',
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          },
          row: {
            colors: ["#f7f7f7", "#fff"],
            opacity: 0.5
          },
          column: {
            colors: ["#fff", "#f7f7f7"],
            opacity: 0.5
          },
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
        },
        chart: {
          id: 'area-datetime',
          type: 'line',
          height: 250,
          zoom: {
            autoScaleYaxis: false
          }
        },

        dataLabels: {
          enabled: false
        },
        markers: {
          size: 0,
          style: 'hollow',
        },
        xaxis: {
          type: 'datetime',
          min: new Date().setDate(new Date().getDate() - 365),
          max: new Date().getTime(),
          tickAmount: 31,
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy'
          }
        },
        stroke: {
          curve: 'straight',
          width: 1
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0.7,
            stops: [0, 100]
          }
        },
      },

      selection: 'one_year',

    };
  }


  updateData(timeline) {
    this.setState({
      selection: timeline
    })
    const now = new Date();
    switch (timeline) {
      case 'one_month':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setMonth(now.getMonth() - 1)).getTime(),
          now.getTime(),
        );
        break
      case 'one_week':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setDate(now.getDate() - 7)).getTime(),
          now.getTime(),
        );
        break;
      case 'one_year':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setFullYear(now.getFullYear() - 1)).getTime(),
          now.getTime(),
        )
        break


      default:
    }
  }


  render() {
    return (

      <div className="chart-daily-active">
        <div id="area-datetime">
          <div className="chart-title">
            <div className="chart-text">Daily Active Devices, %</div>
            <div className="toolbar">
              <button id="one_year"
                onClick={() => this.updateData('one_week')} className={(this.state.selection === 'one_week' ? 'active' : '')}>
                Week
            </button>
              <button id="one_month"

                onClick={() => this.updateData('one_month')} className={(this.state.selection === 'one_month' ? 'active' : '')}>
                Month
              </button>
              <button id="one_year"
                onClick={() => this.updateData('one_year')} className={(this.state.selection === 'one_year' ? 'active' : '')}>
                Year
            </button>

            </div>
          </div>
          <div id="chart-timeline">
            <div className="chart-bg">
              {icons.chartBg}
            </div>

            <ReactApexChart 
              options={this.state.options} 
              series={this.state.series} 
              type="area" 
              height={250} 
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ChartDailyActive;
