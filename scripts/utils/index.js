import * as _ from 'lodash';

export function getQuoteDeltaData(marketData) {
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

export function getDistributionData(quoteDeltaData) {
  const result = [];
  const map = _.countBy(quoteDeltaData, 'value');
  const keysArray = Object.keys(map).sort((a,b) => {
    if (+(a) > +(b)) {
      return 1;
    }
    if (+(a) < +(b)) {
      return -1;
    }
    return 0;
  });
  keysArray.forEach(key => {
    result.push({
      count: map[key + ""],
      quote: key
    });
  });
  return result;
}

export function getSegments(deltaDisturbData = [], N = 6) {
  const totalSum = _.sumBy(deltaDisturbData, 'count');
  const result = [];
  const segmentSize = totalSum / N;
  let localSumCounts = 0;
  let localSumQuotes = 0;
  let count = 0;
  deltaDisturbData.forEach((item) => {
    localSumCounts += item.count;
    localSumQuotes += item.quote;
    count++;
    if (localSumCounts >= segmentSize) {
      result.push({
        ...item,
        average: +(parseFloat(localSumQuotes / count).toFixed(3)),
        prob: +(parseFloat(localSumCounts / totalSum).toFixed(3))
      });
      localSumCounts = localSumQuotes = count = 0;
    }
  });
  return result;
}

export function getClassifiedData(deltaDisturbData, segments) {
  const segmentsArray = _.map(segments, 'quote');
  return deltaDisturbData.map(item => {
    let index = 1;
    while(item.value > segmentsArray[index] && segmentsArray.length > index){
      index++;
    }
    if(item.value > _.last(segmentsArray)) {
      index++;
    }
    return {
    ...item,
    value: index
  }});
}
