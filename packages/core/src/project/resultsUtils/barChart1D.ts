import { BarData, BarStacked1D, BarStacked1DData } from '../types';

type WithNextIndex<T> = { result: T; nextIndex: number };

const getBarStacked1DData = (rows: string[][], i: number): BarStacked1DData => {
  let barData: BarData[] = [];
  let data: BarData[] = [];
  while (rows[i] && rows[i].length > 0 && rows[i][1].length > 0) {
    const total = Number(rows[i][5]);
    // if (total !== 0) {
      // category has to be taken in account
      const categoryName = rows[i][1];
      const restCategoryName = categoryName + 'Rest';
      const score = Number(rows[i][4]);
      const rest = Number(rows[i][5]) - Number(rows[i][4]);
      data.push({
        [categoryName]: score,
        [restCategoryName]: rest,
        categoryName: categoryName,
        score: `${score} / ${total}`,
      });
      barData.push({
        name: categoryName,
        color: rows[i][2],
      });
      barData.push({
        name: restCategoryName,
        color: rows[i][3],
      });
    // }
    i += 1;
  }
  return {
    data,
    barData,
  };
};

export const getBarStacked1D = (
  rows: string[][],
  i: number,
): WithNextIndex<BarStacked1D> => {
  const result: BarStacked1D = {
    type: 'barStacked1D',
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
        result.data = getBarStacked1DData(rows, i);
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};
