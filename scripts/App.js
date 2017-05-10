import React, { Component } from 'react';
import '../vendors/amcharts/amcharts';
import '../vendors/amcharts/serial';
import '../vendors/amcharts/amstock';
import '../vendors/amcharts/themes/dark';
import '../vendors/amcharts/style.css';
import './styles.css';
import * as AmCharts from '@amcharts/amcharts3-react';
import axios from 'axios';

/* global AmCharts  AmStockChart*/
const chartData1 = [];
const chartData2 = [];
const chartData3 = [];
const chartData4 = [];

/*
 olumn_names: [
 "Date",
 "Open",
 "High",
 "Low",
 "Close",
 "Volume",
 "Ex-Dividend",
 "Split Ratio",
 "Adj. Open",
 "Adj. High",
 "Adj. Low",
 "Adj. Close",
 "Adj. Volume"
 ],
 */
function generateChartData() {
  return axios.get('https://www.quandl.com/api/v3/datasets/WIKI/AAPL.json', {
    params: {
      api_key: 'JyAjezBNszuLyrpp3AVs',
      start_date: '1998-01-01',
      end_date: '2017-05-10',
      order: 'asc',
      collapse: 'daily'
    }
  }).then(({ data }) => data.dataset.data.map((item, index) => ({
    date: new Date(item[0]),
    value: parseFloat(item[4] / (data.dataset.data[index - 1] || [])[4]).toFixed(3),
    volume: item[5]
  })));
}

function normalzie(dataset) {
  const normal = {};
  const result = [];
  dataset.forEach(item => {
    if (isNaN(item.value)) {
      return;
    }
    if (normal[item.value]) {
      normal[item.value]++;
    } else {
      normal[item.value] = 1;
    }
  });
  const keysArray = Object.keys(normal).sort();
  keysArray.forEach(key => {
    result.push({
      value: normal[key],
      prob: key
    });
  });
  return result;
}

function getSegments(gaussianData = [], N = 6) {
  if (!gaussianData.length) {
    return [];
  }
  let totalSum = 0;
  gaussianData.forEach(item => {
    totalSum += item.value;
  });
  const segmentSize = totalSum / (N - 1);
  const result = [gaussianData[0]];
  totalSum = 0;
  gaussianData.forEach(item => {
    totalSum += item.value;
    if (totalSum >= segmentSize) {
      result.push(item);
      totalSum = 0;
    }
  });
  result.push(gaussianData[gaussianData.length - 1]);
  return result;
}

function encodeToClass(dataset, segments) {
  const segmentsArray = segments.map(segment => segment.prob);
  return dataset.map(item => {
    let groupIndex = 1;
    segmentsArray.forEach((segment, index) => {
      if(segment < item.value) {
        groupIndex = index;
      } else {
        return false;
      }

    });
    item.value = groupIndex;
    return item;
  })
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.segments = [];
    generateChartData().then(dataset => {
      const dataset2 = normalzie(dataset);
      this.segments = getSegments(dataset2, 6);
      const dataset1 = encodeToClass(dataset, this.segments);
      console.log(dataset1);
      this.setState({ dataset1, dataset2});
    });
  }

  render() {
    const config = {
      type: 'stock',
      theme: 'dark',

      dataSets: [{
        title: 'first data set',
        fieldMappings: [{
          fromField: 'value',
          toField: 'value'
        }, {
          fromField: 'volume',
          toField: 'volume'
        }],
        dataProvider: this.state.dataset1,
        categoryField: 'date'
      }],
      panels: [{
        showCategoryAxis: false,
        title: 'Value',
        percentHeight: 70,

        stockGraphs: [{
          id: 'g1',

          valueField: 'value',
          comparable: true,
          compareField: 'value',
          bullet: 'round',
          balloonText: '[[title]]:<b>[[value]]</b>',
          compareGraphBalloonText: '[[title]]:<b>[[value]]</b>',
          compareGraphBullet: 'round'
        }],

        stockLegend: {
          periodValueTextComparing: '[[percents.value.close]]%',
          periodValueTextRegular: '[[value.close]]'
        }
      },

      {
        title: 'Volume',
        percentHeight: 30,
        stockGraphs: [{
          valueField: 'volume',
          type: 'column',
          showBalloon: false,
          fillAlphas: 1
        },
        ],


        stockLegend: {
          periodValueTextRegular: '[[value.close]]'
        }
      }
      ],

      chartScrollbarSettings: {
        graph: 'g1'
      },

      chartCursorSettings: {
        valueBalloonsEnabled: true
      },

      periodSelector: {
        position: 'left',
        periods: [{
          period: 'DD',
          count: 10,
          label: '10 days'
        }, {
          period: 'MM',
          selected: true,
          count: 1,
          label: '1 month'
        }, {
          period: 'YYYY',
          count: 1,
          label: '1 year'
        }, {
          period: 'YTD',
          label: 'YTD'
        }, {
          period: 'MAX',
          label: 'MAX'
        }]
      },

      dataSetSelector: {
        position: 'left'
      }
    };

    const config2 = {
      type: 'serial',
      theme: 'dark',
      dataProvider: this.state.dataset2,
      guides: this.segments.map((item, index) => ({
        category: item.prob,
        lineColor: '#CC0000',
        label: `N = ${index + 1}`,
        labelOffset: 15,
        lineAlpha: 1,
        dashLength: 2
      })),
      valueAxes: [{
        gridColor: '#FFFFFF',
        gridAlpha: 0.2,
        dashLength: 0,
      }],

      gridAboveGraphs: true,
      startDuration: 1,
      graphs: [{
        balloonText: '<b>[[category]]: [[value]]</b>',
        fillColorsField: 'color',
        fillAlphas: 0.9,
        lineAlpha: 0.2,
        type: 'column',
        valueField: 'value'
      }],
      chartCursor: {
        categoryBalloonEnabled: false,
        cursorAlpha: 0,
        zoomable: false
      },
      categoryField: 'prob',
      export: {
        enabled: true
      }
    };

    return (
      <div>
        <div className="chart1">
          <AmCharts.React {...config} />
        </div>
        <div className="chart2">
          <AmCharts.React {...config2} />
        </div>
      </div>
    );
  }
}
