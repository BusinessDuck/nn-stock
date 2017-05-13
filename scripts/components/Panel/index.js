import React, { PropTypes, Component } from 'react';
import SelectItem from 'react-select-item';
import 'react-select-item/example/select-box.css';
import './styles.css';

export default class Panel extends Component {
  static propTypes = {
    symbolChangeHandler: PropTypes.func,
    segmentChangeHandler: PropTypes.func,
    onPrecissionChange: PropTypes.func,
    onLayerChange: PropTypes.func,
    onWindowChange: PropTypes.func,
  };

  static defaultProps = {
    symbolChangeHandler: () => null,
    segmentChangeHandler: () => null,
    onPrecissionChange: () => null,
    onLayerChange: () => null,
    onWindowChange: () => null,
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
  onPrecissionChangeHandler = (e) => {
    this.props.onPrecissionChange(+(e.target.value));
  };
  onLayersChangeHandler = (e) => {
    this.props.onLayerChange(+(e.target.value));
  };
  onWindowChangeHandler = (e) => {
    this.props.onWindowChange(+(e.target.value));
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
            <label>ТОчность округления:</label>
            <input type="number" min="1" max="6" step="1" defaultValue="3" onChange={this.onPrecissionChangeHandler} />
          </div>
          <div className="input">
            <label>Количество сегментов:</label>
            <input type="number" min="6" max="30" step="1" defaultValue="6" onChange={this.onSegmentChangeHandler} />
          </div>
          <div className="input">
            <label>Кол-во слоёв в сети:</label>
            <input type="number" min="1" max="200" step="1" defaultValue="10" onChange={this.onLayersChangeHandler} />
          </div>
          <div className="input">
            <label>Размер окна:</label>
            <input type="number" min="1" max="200" step="1" defaultValue="5" onChange={this.onWindowChangeHandler} />
          </div>

        </div>

      </div>
    );
  }
}
