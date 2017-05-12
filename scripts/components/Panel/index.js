import React, { PropTypes, Component } from 'react';
import SelectItem from 'react-select-item';
import 'react-select-item/example/select-box.css';
import './styles.css';

export default class Panel extends Component {
  static propTypes = {
    symbolChangeHandler: PropTypes.func,
    segmentChangeHandler: PropTypes.func
  };

  static defaultProps = {
    symbolChangeHandler: () => null,
    segmentChangeHandler: () => null
  };

  constructor(props) {
    super(props);
    this.state = {
      symbol: null
    };
    this.symbols = ['AAPL', 'IBM', 'GOOG'].map((item) => ({ name: item, value: item }));
  }

  onSymbolChangeHandler = (symbol) => {
    this.setState({ symbol });
    this.props.symbolChangeHandler(symbol);
  };

  onSegmentChangeHandler = (e) => {
    this.props.segmentChangeHandler(+(e.target.value));
  };

  render() {
    return (
      <div>
        <div className="panel">
          <SelectItem
            onChange={this.onSymbolChangeHandler}
            value={this.state.symbol}
            closeText={false}
            multiple={false}
          >
            { this.symbols.map((item, index) => (
              <option key={index} value={item.value}>{item.name}</option>
            ))}
          </SelectItem>

          <hr />
          <div className="input">
            <label>Количество сегментов:</label>
            <input type="number" min="6" max="30" step="1" defaultValue="6" onChange={this.onSegmentChangeHandler} />
          </div>

        </div>

      </div>
    );
  }
}
