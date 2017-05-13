import synaptic from 'synaptic';
import {merge} from 'lodash';

export default class Network {

  constructor(params, options) {
    this.network = new synaptic.Architect.LSTM(...params);
    this.options = merge(this.defaultOptions, options);
    this.network.optimize();
  }

  train = (dataset) => {
    return new Promise((resolve) => {
      for(let i = 0; i <= 1 ; ++i){
        dataset.forEach(item => {
          this.network.activate(item.input);
          this.network.propagate(.00000000001, item.output);
          resolve(true);
        });
      }
    });
  };

  activate(input){
    return this.network.activate(input);
  }

  save() {
  }

  restore() {
  }

}
