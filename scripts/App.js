import React, { Component } from 'react';
import axios from 'axios';
import * as _ from 'lodash';
import SelectItem from 'react-select-item';
import '../vendors/amcharts/amcharts';
import '../vendors/amcharts/serial';
import '../vendors/amcharts/amstock';
import '../vendors/amcharts/themes/dark';
import '../vendors/amcharts/style.css';
import './styles.css';
import 'react-select-item/example/select-box.css';
import * as AmCharts from '@amcharts/amcharts3-react';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.segments = [];
    this.symbols = ['AAPL', 'IBM', 'GOOG'].map((item) => ({ name: item, value: item }));
  }

  getMarketData = (symbol) => axios.get(`https://www.quandl.com/api/v3/datasets/WIKI/${symbol}.json`, {
    params: {
      api_key: 'JyAjezBNszuLyrpp3AVs',
      start_date: '1998-01-01',
      end_date: '2017-05-10',
      order: 'asc',
      collapse: 'daily'
    }
  }).then(response => response.data.dataset.data);

  symbolChangeHandler = (symbol) => {
    console.log(symbol);
    this.setState({ symbol });
    this.getMarketData(symbol).then(marketData => {
      const quoteDeltaData = this.getQuoteDeltaData(marketData);
      const deltaDisturbData = this.getDistributionData(quoteDeltaData);
      const segments = this.getSegments(deltaDisturbData, 6);
      const quoteClassesData = this.getClassifiedData(quoteDeltaData, segments);
      this.setState({ marketData, quoteDeltaData, deltaDisturbData, segments, quoteClassesData });
      return marketData;
    });
  };

  getQuoteDeltaData(marketData) {
    const result = [];
    marketData.forEach((item, index) => {
      if (index <= 1) {
        return null;
      }
      result.push({
        date: new Date(item[0]),
        value: parseFloat(item[4] / (marketData[index - 1] || [])[4]).toFixed(3),
        volume: item[5]
      });
    });
    return result;
  }

  getDistributionData(quoteDeltaData) {
    const result = [];
    const map = _.countBy(quoteDeltaData, 'value');
    const keysArray = Object.keys(map).sort();
    keysArray.forEach(key => {
      result.push({
        count: map[key],
        quote: key
      });
    });
    return result;
  }

  getSegments(deltaDisturbData = [], N = 6) {
    const totalSum = _.sumBy(deltaDisturbData, 'value');
    const result = [];
    const segmentSize = totalSum / (N - 1);
    result.push(_.head(deltaDisturbData));
    let localSumCounts = 0;
    let localSumQuotes = 0;
    let count = 0;
    deltaDisturbData.forEach(item => {
      localSumCounts += item.count;
      localSumQuotes += item.quote;
      count++;
      if (localSumCounts >= segmentSize) {
        result.push({ ...item, average: parseFloat(localSumQuotes / count).toFixed(3) });
        localSumCounts = localSumQuotes = count = 0;
      }
    });
    result.push(_.last(deltaDisturbData));
    return result;
  }

  getClassifiedData(deltaDisturbData, segments) {
    const segmentsArray = _.map(segments, 'quote');
    return deltaDisturbData.map(item => ({
      ...item,
      value: _.findIndex(segmentsArray, segmentValue => segmentValue > item.value)
    }));
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
        dataProvider: this.state.quoteClassesData,
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
      dataProvider: this.state.deltaDisturbData,
      guides: this.segments.map((item, index) => ({
        category: item.quote,
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
        valueField: 'count'
      }],
      chartCursor: {
        categoryBalloonEnabled: false,
        cursorAlpha: 0,
        zoomable: false
      },
      categoryField: 'quote',
      export: {
        enabled: true
      }
    };

    return (
      <div>
        <div className="panel">
          <SelectItem
            onChange={this.symbolChangeHandler}
            value={this.state.symbol}
            closeText={false}
            multiple={false}
          >
            { this.symbols.map((item, index) => (
              <option key={index} value={item.value}>{item.name}</option>
            ))}
          </SelectItem>
        </div>
        <div>
          <div className="chart1">
            <AmCharts.React {...config} />
          </div>
          <div className="chart2">
            <AmCharts.React {...config2} />
          </div>
        </div>
      </div>
    );
  }
}
