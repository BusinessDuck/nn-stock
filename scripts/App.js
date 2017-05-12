import React, { Component } from 'react';
import axios from 'axios';
import './styles.css';
import Charts from './components/Charts';
import Panel from './components/Panel';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = { preloader: false, showCharts: true };
  }

  getMarketData = (symbol) => {
    this.setState({ preloader: true });
    return axios.get(`https://www.quandl.com/api/v3/datasets/WIKI/${symbol}.json`, {
      params: {
        api_key: 'JyAjezBNszuLyrpp3AVs',
        start_date: '1998-01-01',
        end_date: '2017-05-10',
        order: 'asc',
        collapse: 'daily'
      }
    }).then(response => {
      this.setState({ preloader: false });
      return response.data.dataset.data;
    });
  };


  symbolChangeHandler = (symbol) => {
    if (!symbol) {
      return;
    }
    this.getMarketData(symbol).then(marketData => {
      this.setState({ marketData });
      return marketData;
    });
  };

  segmentChangeHandler = (segmentCount) => {
    this.setState({ segmentCount, showCharts: false }, () => {
      this.setState({ showCharts: true });
    });
  };

  render() {
    return (
      <div>
        <Panel symbolChangeHandler={this.symbolChangeHandler} segmentChangeHandler={this.segmentChangeHandler} />
        { this.state.showCharts ?
          <Charts refs={node => this.charts = node} marketData={this.state.marketData} loading={this.state.preloader} segmentCount={this.state.segmentCount} />
            : null
        }
      </div>
    );
  }
}
