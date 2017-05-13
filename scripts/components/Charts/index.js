import React, {PropTypes, Component} from 'react';
import * as _ from 'lodash';
import * as utils from '../../utils';
import '../../../vendors/amcharts/amcharts';
import '../../../vendors/amcharts/serial';
import '../../../vendors/amcharts/amstock';
import '../../../vendors/amcharts/themes/dark';
import '../../../vendors/amcharts/style.css';
import * as AmCharts from '@amcharts/amcharts3-react';
import './styles.css';
import Neural from '../../utils/neural';

export default class Charts extends Component {
  static propTypes = {
    marketData: PropTypes.array,
    loading: PropTypes.bool,
    segmentCount: PropTypes.number,
    precission: PropTypes.number,
    neuralParams: PropTypes.array,
    windowSize: PropTypes.number,
    testPercentage: PropTypes.number,
  };

  static defaultProps = {
    marketData: [],
    loading: false,
    segmentCount: 6,
    precission: 3,
    neuralParams: [5, 4, 1],
    windowSize: 5,
    testPercentage: 50,
  };

  constructor(props) {
    super(props);
    this.neural = new Neural(this.props.neuralParams);
  }

  // training start
  trainNetwork() {
    if (!this.quoteClassesData) {
      return;
    }

    const quotesArray = _.map(this.quoteClassesData, 'value');
    const traingSet = [];
    while (100 * (quotesArray.length / this.quoteClassesData.length) > this.props.testPercentage) {
      const input = _.take(quotesArray, this.props.windowSize);
      const output = [quotesArray[this.props.windowSize]];
      quotesArray.splice(0, 1);
      traingSet.push({input, output});
    }
    this.neural.train(traingSet).then(result => {
        const {chart} = this.chart2.state;
        const neuralDataset = [];
        const leftQuotes = _.takeRight(this.quoteClassesData, quotesArray.length + 1);
        while (leftQuotes.length > this.props.windowSize) {
        const input = _.map(_.take(leftQuotes, this.props.windowSize), "value");
        const date = leftQuotes[this.props.windowSize].date;
        const output = this.neural.activate(input).pop();
        debugger;
        const arrayOfDecode = _.range(0, 1, 1 / this.props.segmentCount);
        arrayOfDecode.push(1);
        const value = _.findIndex(arrayOfDecode, function(item) { return item  > output });
        leftQuotes.splice(0,1);
          neuralDataset.push({
            value,
            date
          });
        }
        chart.dataSets.push({
          title: "Neural Data",
          fieldMappings: [{
            fromField: 'value',
            toField: 'value'
          }],
          dataProvider: neuralDataset,
          categoryField: 'date',
          compared: true
        });
        chart.validateData();
        console.log(result);
      }
    )
    ;
    // training end
  }

  render() {
    if (this.props.loading) {
      return (
        <div className="loader">
          <span> {'{'} </span> <span> {'}'} </span>
        </div>
      );
    }
    if (!this.props.marketData.length) {
      return null;
    }
    const {precission} = this.props;
    this.quoteDeltaData = utils.getQuoteDeltaData(this.props.marketData, precission);
    this.deltaDisturbData = utils.getDistributionData(this.quoteDeltaData);
    this.segments = utils.getSegments(this.deltaDisturbData, this.props.segmentCount, precission);
    this.quoteClassesData = utils.getClassifiedData(this.quoteDeltaData, this.segments);
    this.deltaDisturbDataClasses = utils.getDistributionData(this.quoteClassesData);


    const config = {
      type: 'stock',
      theme: 'dark',
      dataSets: [{
        title: 'Quotes clsoe price diff',
        fieldMappings: [{
          fromField: 'value',
          toField: 'value'
        }, {
          fromField: 'volume',
          toField: 'volume'
        }],
        dataProvider: this.quoteDeltaData,
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
      }, {
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
      }
    };

    const config3 = {
      type: 'serial',
      theme: 'dark',
      dataProvider: this.deltaDisturbData,
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

    const config4 = {
      type: 'serial',
      theme: 'dark',
      dataProvider: this.deltaDisturbDataClasses,
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

    const config2 = {
      type: 'stock',
      theme: 'dark',
      dataSets: [{
        title: 'Quotes clsoe price diff',
        fieldMappings: [{
          fromField: 'value',
          toField: 'value'
        }, {
          fromField: 'volume',
          toField: 'volume'
        }],
        dataProvider: this.quoteClassesData,
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
      }, {
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
      }
    };
    this.trainNetwork();
    return (
      <div className="charts">
        <div className="chart1">
          <AmCharts.React {...config} />
        </div>
        <div className="chart2">
          <AmCharts.React {...config2} ref={node => this.chart2 = node}/>
        </div>
        <div className="chart3">
          <AmCharts.React {...config3} />
        </div>
        <div className="chart4">
          <AmCharts.React {...config4} />
        </div>
      </div>
    );
  }
}
