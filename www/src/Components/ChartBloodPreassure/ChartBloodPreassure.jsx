import React from 'react'
import './ChartBloodPreassure.css'
import ApexCharts from 'apexcharts';
import ReactApexChart from "react-apexcharts";

class ChartBloodPreassure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.minMax(props.device?.data ?? []),
      options: {
        chart: {
          id: 'area-datetime',
          type: 'area',
          height: 350,
          zoom: {
            autoScaleYaxis: true
          }
        },
        tooltip: {
          enabled: true,
          enabledOnSeries: undefined,
          shared: true,
          followCursor: false,
          intersect: false,
          inverseOrder: false,
          custom: undefined,
          fillSeriesColor: false,
          theme: false,
          style: {
            fontSize: '12px',
            fontFamily: undefined
          },
          onDatasetHover: {
            highlightDataSeries: false,
          },
          x: {
            show: true,
            format: 'dd MMM',
            formatter: undefined,
          },
          y: {
            formatter: undefined,
            title: {
              formatter: (seriesName) => seriesName,
            },
          },
          z: {
            formatter: undefined,
            title: 'Size: '
          },
          marker: {
            show: true,
          },
          items: {
            display: "flex",
          },
          fixed: {
            enabled: false,
            position: 'topRight',
            offsetX: 0,
            offsetY: 0,
          },
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
        colors: ['#2178C9', '#EF476A'],
        dataLabels: {
          enabled: false
        },
        markers: {
          enabled: false
        },
        xaxis: {
          type: 'datetime',
          ...this.minMax(props.device?.data ?? []),
          tickAmount: 1,
        },
        yaxis: {
          type: 'int',
          min: 0,
          max: 200,
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
            opacityTo: 0.1,
            stops: [0, 100]
          }
        },
        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      },
      selection: 'all',
    };

    if (this.props.collectUpdater) {
      // console.log('DEVICE:', { device: props.device });
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
    // console.log('Blood', { timeline });
    const now = new Date();
    switch (timeline) {
      case 'month':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setMonth(now.getMonth() - 1)).getTime(),
          now.getTime(),
        );
        break;
      case 'week':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setDate(now.getDate() - 7)).getTime(),
          now.getTime(),
        );
        break;
      case 'year':
        ApexCharts.exec(
          'area-datetime',
          'zoomX',
          new Date(new Date().setFullYear(now.getFullYear() - 1)).getTime(),
          now.getTime(),
        );

    }

    this.setState({
      selection: timeline
    });
  }

  name() {
    const label = document.querySelectorAll(".blood-preassure .apexcharts-legend-text")
    const texts = ["Systolic", "Diastolic"];
    const names = document.querySelectorAll("blood-preassure .apexcharts-legend-series");
    function replace(params) {
      label.forEach((e, index) => {
        e.innerHTML = texts[index]
      })
    }
    names.forEach(name => {
      name.addEventListener("click", replace())
    })
    replace()
  }

  componentDidMount() {
    this.name()
  }
  componentDidUpdate() {
    this.name()
  }

  updateFrame = (id, frame) =>
    this.props.onTimeframeUpdate &&
    this.props.onTimeframeUpdate(id, frame);

  render() {
    const data = this.props.device?.data ?? [];
    //console.log({ data });
    this.name()
    const chartData = [
      {
        name: 'mm Hg',
        data: data.map(m => [new Date(m.reading_datetime).getTime(), m.systolic_value]),
      },
      {
        name: 'mm Hg',
        data: data.map(m => [new Date(m.reading_datetime).getTime(), m.diastolic_value]),
      },
    ];



    const dId = this.props.device.id;
    const model = this.props.device.model;
    const type = this.props.device.type;

    return (
      <div id="chartBloodPressure" className="chartBloodPressure">
        <div className="chart-title">
          <div className="chart-text">Blood Pressure, mm Hg</div>
          <div className="toolbar">
            <button id="week"
              onClick={() => this.updateFrame(dId, 'week')} className={(this.state.selection === 'week' ? 'active' : '')}>
              Week
        </button>
            <button id="one_month"
              onClick={() => this.updateFrame(dId, 'month')} className={(this.state.selection === 'month' ? 'active' : '')}>
              Month
        </button>
            <button id="one_year"
              onClick={() => this.updateFrame(dId, 'year')} className={(this.state.selection === 'year' ? 'active' : '')}>
              Year
        </button>

          </div>
        </div>

        <div className="line-chart-container">
          {
            (data?.length)
              ?
              <ReactApexChart
                options={this.state.options}
                series={chartData}
                type="area"
                className='blood-preassure'
              />
              :
              <div className="noDataHint">
                No data available
              <div>for {type} {model}</div>
              </div>
          }

        </div>
      </div>
    );
  }
}

export default ChartBloodPreassure;
