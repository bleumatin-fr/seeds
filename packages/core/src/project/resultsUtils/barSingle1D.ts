import { BarData, BarSingle1D, BarSingle1DData } from '../types';

type WithNextIndex<T> = { result: T; nextIndex: number };

const getBarSingle1DData = (rows: string[][], i: number): BarSingle1DData => {
  let barData: BarData[] = [];
  let data: BarData[] = [];
  i=i+1;
  while (rows[i] && rows[i].length > 0 && rows[i][1].length > 0) {
    // category has to be taken in account
    const categoryName = rows[i][1];
    const score = Number(rows[i][3]);
    data.push({
    [categoryName]: score,
    categoryName,
    });
    barData.push({
    name: categoryName,
    color: rows[i][2],
    });
    i += 1;
  }
  return {
    data,
    barData,
  };
};

export const getBarSingle1D = (
  rows: string[][],
  i: number,
): WithNextIndex<BarSingle1D> => {
  const result: BarSingle1D = {
    type: 'barSingle1D',
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'code':
      case 'scope':
      case 'title':
      case 'size':
      case 'unit':
      case 'subtitle':
      case 'description':
        result[key] = rows[i][1];
        break;
      case 'table':
        result.data = getBarSingle1DData(rows, i);
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};
