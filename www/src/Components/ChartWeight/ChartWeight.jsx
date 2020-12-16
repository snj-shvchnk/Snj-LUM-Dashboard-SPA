import React from 'react'
import './ChartWeight.css'
import ApexCharts from 'apexcharts';
import ReactApexChart from "react-apexcharts";

class ChartWeight extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...this.minMax(props.device?.data ?? []),
      options: {
        chart: {
          id: 'area-weight',
          type: 'area-weight',
          height: 10,
          zoom: {
            autoScaleYaxis: true
          }
        },
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
            },
            axisTicks: {
              show: true,
              borderType: 'solid',
              color: '#f7f7f7',
              width: 6,
              offsetX: 0,
              offsetY: 0
            },
            labels: {
              show: true,
              align: 'left',
              minWidth: 0,
              maxWidth: 160,
              style: {
                colors: ["f7f7f7"],
                fontSize: '12px',

                fontWeight: 400,
                cssClass: 'apexcharts-yaxis-label',
              },
              offsetX: 0,
              offsetY: 0,
              rotate: 0,

            },
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
        colors: ['#932688'],
        dataLabels: {
          enabled: false
        },
        markers: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          ...this.minMax(props.device?.data ?? []),
          tickAmount: 6,
        },
        yaxis: {
          type: 'int',
          min: 100,
          max: 300,
          tickAmount: 10,
        },
        stroke: {
          curve: 'straight',
          width: 1
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0.3,
            stops: [0, 100]
          }
        },
        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      },
      selection: 'all',
    };

    if (this.props.collectUpdater) {
      this.props.collectUpdater(
        props.device.id,
        (time) => this.updateData(time)
      );
    }
  }


  minMax = (array) => {
    const min = Math.min(...(array.map(m => new Date(m.reading_datetime).getTime())));
    const max = Math.max(...(array.map(m => new Date(m.reading_datetime).getTime())));
    return { min, max };
  }


  updateData(timeline) {
    // console.log('Weight', { timeline });
    const now = new Date();
    switch (timeline) {
      case 'month':
        ApexCharts.exec(
          'area-weight',
          'zoomX',
          new Date(new Date().setMonth(now.getMonth() - 1)).getTime(),
          now.getTime(),
        );
        break;
      case 'week':
        ApexCharts.exec(
          'area-weight',
          'zoomX',
          new Date(new Date().setDate(now.getDate() - 7)).getTime(),
          now.getTime(),
        );
        break;
      case 'year':
        ApexCharts.exec(
          'area-weight',
          'zoomX',
          new Date(new Date().setFullYear(now.getFullYear() - 1)).getTime(),
          now.getTime(),
        );
        break;
      case 'all':
        ApexCharts.exec(
          'area-weight',
          'zoomX',
          this.state.min,
          this.state.max,
        );
        break;
    }

    this.setState({
      selection: timeline
    });
  }

  updateFrame = (id, frame) =>
    this.props.onTimeframeUpdate &&
    this.props.onTimeframeUpdate(id, frame);


  render() {

    const data = this.props.device?.data ?? [];
    // console.log({ data });
    const chartData = [
      {
        name: 'Weight, lbs',
        data: data.map(m => [new Date(m.reading_datetime).getTime(), m.weight_lbs]),
      }
    ];

    const { id, model, type } = this.props.device;

    return (
      <>
        <div id="chartWeight">
          <div className="chart-title">
            <div className="chart-text">Weight, lbs </div>
            <div className="toolbar">
              <button id="week_weight"
                onClick={() => this.updateFrame(id, 'week')} className={(this.state.selection === 'week' ? 'active' : '')}>
                Week
        </button>
              <button id="one_month_weight"
                onClick={() => this.updateFrame(id, 'month')} className={(this.state.selection === 'month' ? 'active' : '')}>
                Month
        </button>
              <button id="one_year_weight"
                onClick={() => this.updateFrame(id, 'year')} className={(this.state.selection === 'year' ? 'active' : '')}>
                Year
        </button>

            </div>
          </div>

          <div className="line-chart-container">
            {
              data?.length
                ?
                <ReactApexChart options={this.state.options} series={chartData} type="area" className='weight-chart' />
                :
                <div className="noDataHint">
                  No data available
              <div>for {type} {model}</div>
                </div>
            }
          </div>

        </div>
      </>
    );
  }
}

export default ChartWeight;
