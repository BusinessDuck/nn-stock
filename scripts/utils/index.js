import * as _ from 'lodash';

export function getQuoteDeltaData(marketData, precission) {
  const result = [];
  marketData.forEach((item, index) => {
    if (index <= 1) {
      return null;
    }
    result.push({
      date: new Date(item[0]),
      value: parseFloat(item[4] / (marketData[index - 1] || [])[4]).toFixed(precission),
      volume: item[5]
    });
  });
  return result;
}

export function getDistributionData(quoteDeltaData) {
  const result = [];
  const map = _.countBy(quoteDeltaData, 'value');
  const keysArray = Object.keys(map).sort((a, b) => {
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
      count: map[`${key}`],
      quote: key
    });
  });
  return result;
}

export function getSegments(deltaDisturbData = [], N = 6, precission) {
  const totalSum = _.sumBy(deltaDisturbData, 'count');
  const result = [];
  const segmentSize = totalSum / N;
  let localSumCounts = 0;
  let localSumQuotes = 0;
  let count = 0;
  let min = 2;
  deltaDisturbData.forEach((item) => {
    localSumCounts += +(item.count);
    localSumQuotes += +(item.quote);
    if (item.quote < min) {
      min = item.quote;
    }
    count++;
    if (localSumCounts > segmentSize) {
      result.push({
        ...item,
        min,
        average: +(parseFloat(localSumQuotes / count).toFixed(precission)),
        prob: +(parseFloat(localSumCounts / totalSum).toFixed(precission))
      });
      localSumCounts = localSumQuotes = count = 0;
    }
  });
  return result;
}

export function getClassifiedData(deltaDisturbData, segments) {
  const segmentsArray = _.map(segments, 'quote');
  segmentsArray.unshift(0);
  segmentsArray.push(100);
  let groupNum = 0;
  return deltaDisturbData.map(item => {
    _.takeWhile(segmentsArray, ((segmentValue, index) => {
      if (+(item.value) < +(segmentValue)) {
        groupNum = index;
        return false;
      }
      return true;
    }));
    return {
      ...item,
      value: groupNum
    };
  });
}
