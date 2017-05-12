import React, { PropTypes, Component } from 'react';
import * as utils from '../../utils';
import '../../../vendors/amcharts/amcharts';
import '../../../vendors/amcharts/serial';
import '../../../vendors/amcharts/amstock';
import '../../../vendors/amcharts/themes/dark';
import '../../../vendors/amcharts/style.css';
import * as AmCharts from '@amcharts/amcharts3-react';
import './styles.css';

export default class Charts extends Component {
  static propTypes = {
    marketData: PropTypes.array,
    loading: PropTypes.bool,
    segmentCount: PropTypes.number,
    precission: PropTypes.number,
  };

  static defaultProps = {
    marketData: [],
    loading: false,
    segmentCount: 6,
    precission: 3
  };

  constructor(props) {
    super(props);
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
    const quoteDeltaData = utils.getQuoteDeltaData(this.props.marketData, precission);
    const deltaDisturbData = utils.getDistributionData(quoteDeltaData);
    const segments = utils.getSegments(deltaDisturbData, this.props.segmentCount, precission);
    const quoteClassesData = utils.getClassifiedData(quoteDeltaData, segments);
    const deltaDisturbDataClasses = utils.getDistributionData(quoteClassesData);

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
        dataProvider: quoteDeltaData,
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

    const config2 = {
      type: 'serial',
      theme: 'dark',
      dataProvider: deltaDisturbData,
      guides: segments.map((item, index) => ({
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
      dataProvider: deltaDisturbDataClasses,
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

    const config3 = {
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
        dataProvider: quoteClassesData,
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

    return (
      <div className="charts">
        <div className="chart1">
          <AmCharts.React {...config} />
        </div>
        <div className="chart2">
          <AmCharts.React {...config3} />
        </div>
        <div className="chart3">
          <AmCharts.React {...config2} />
        </div>
        <div className="chart4">
          <AmCharts.React {...config4} />
        </div>
      </div>
    );
  }
}
