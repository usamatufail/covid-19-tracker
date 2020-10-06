import React from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import axios from "../axios";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint,
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

function LineGraph({ casesType = "cases" }) {
  const [data, setData] = React.useState({});

  React.useEffect(() => {
    const getLast120DaysData = async () => {
      const res = await axios.get("/historical/all?lastdays=120");
      const chartData = await buildChartData(res.data, casesType);
      setData(chartData);
    };
    getLast120DaysData();
  }, [casesType]);

  return (
    <div className="lineGraph">
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                data: data,
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                borderColor: "#cc1034",
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default LineGraph;
