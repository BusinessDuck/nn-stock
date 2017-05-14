import React, {Component} from 'react';
import axios from 'axios';
import './styles.css';
import Charts from './components/Charts';
import Panel from './components/Panel';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {preloader: false, showCharts: true, window: 5, layers: 5};
  }

  getMarketData = (symbol) => {
    this.setState({preloader: true});
    return axios.get(`https://www.quandl.com/api/v3/datasets/WIKI/${symbol}.json`, {
      params: {
        api_key: 'JyAjezBNszuLyrpp3AVs',
        start_date: '2010-01-01',
        end_date: '2017-05-10',
        order: 'asc',
        collapse: 'daily'
      }
    }).then(response => {
      this.setState({preloader: false});
      return response.data.dataset.data;
    });
  };

  symbolChangeHandler = (symbol) => {
    if (!symbol) {
      return;
    }
    this.getMarketData(symbol).then(marketData => {
      this.setState({marketData});
      return marketData;
    });
  };

  segmentChangeHandler = (segmentCount) => {
    this.setState({segmentCount, showCharts: false}, () => {
      this.setState({showCharts: true});
    });
  };

  precissionChangeHandler = (precission) => {
    this.setState({precission, showCharts: false}, () => {
      this.setState({showCharts: true});
    });
  };

  layersChangeHandler = (layers) => {
    this.setState({layers, showCharts: false}, () => {
      this.setState({showCharts: true});
    });
  };

  windowChangeHandler = (window) => {
    this.setState({window, showCharts: false}, () => {
      this.setState({showCharts: true});
    });
  };

  percentChangeHandler = (percent) => {
    this.setState({percent, showCharts: false}, () => {
      this.setState({showCharts: true});
    });
  };

  render() {
    return (
      <div>
        <Panel
          symbolChangeHandler={this.symbolChangeHandler}
          segmentChangeHandler={this.segmentChangeHandler}
          onPrecissionChange={this.precissionChangeHandler}
          onLayerChange={this.layersChangeHandler}
          onWindowChange={this.windowChangeHandler}
          onPercentChange={this.percentChangeHandler}
        />
        { this.state.showCharts ?
          <Charts
            ref={node => this.charts = node}
            marketData={this.state.marketData}
            loading={this.state.preloader}
            segmentCount={this.state.segmentCount}
            precission={this.state.precission}
            neuralParams={[this.state.window, this.state.layers, 1]}
            windowSize={this.state.window}
            testPercentage={this.state.percent}
          />
          : null
        }
      </div>
    );
  }
}
