import { BarData, BarStacked2D, BarStacked2DData } from '../types';

type WithNextIndex<T> = { result: T; nextIndex: number };

interface BarDataProps {
  name: string;
  key: string;
  value: number;
  restValue: number;
}

const getBarData = ({ name, key, value, restValue }: BarDataProps): BarData => {
  return {
    name,
    [key]: value,
    rest: restValue,
  };
};

const getSubCatData = (row: string[]): BarData => {
  return {
    name: row[3],
    score: parseInt(row[5]),
    rest: parseInt(row[6]) - parseInt(row[5]),
  };
};

const getBarStacked2DData = (rows: string[][], i: number): BarStacked2DData => {
  let categoryData: BarData[] = [];
  let barData: BarData[] = [];
  while (rows[i] && rows[i].length > 0 && rows[i][1].length > 0) {
    if (rows[i][6] !== '0') {
      // subcategory has to be taken in account
      const categoryName = rows[i][1];
      const categoryIndex = categoryData.findIndex(
        (category) => category.name === categoryName,
      );
      if (categoryIndex === -1) {
        //new category
        categoryData.push(
          getBarData({
            name: rows[i][1],
            key: i.toString(),
            value: parseInt(rows[i][5]),
            restValue: parseInt(rows[i][6]) - parseInt(rows[i][5]),
          }),
        );
        categoryData[categoryData.length - 1].subCategoryData = {
          categoryData: [],
          barData: [{ dataKey: 'rest', color: 'grey' }],
        };
      } else {
        categoryData[categoryIndex][i.toString()] = parseInt(rows[i][5]);
        categoryData[categoryIndex]['rest'] =
          (categoryData[categoryIndex]['rest'] as number) +
          parseInt(rows[i][6]) -
          parseInt(rows[i][5]);
      }
      if (rows[i][3].length > 0) {
        barData.push({
          dataKey: i.toString(),
          color: rows[i][4],
          label: rows[i][3],
        });
        categoryData[categoryData.length - 1].subCategoryData.categoryData.push(
          getBarData({
            name: rows[i][3],
            key: rows[i][3],
            value: parseInt(rows[i][5]),
            restValue: parseInt(rows[i][6]) - parseInt(rows[i][5]),
          }),
        );
        categoryData[categoryData.length - 1].subCategoryData.barData.unshift({
          dataKey: rows[i][3],
          color: rows[i][4],
        });
      } else {
        // no subcategory
        barData.push({
          dataKey: i.toString(),
          color: rows[i][2],
          label: rows[i][1],
        });
      }
    }
    i += 1;
  }
  barData.push({
    dataKey: 'rest',
    color: 'grey',
  });
  const data: BarStacked2DData = { categoryData, barData };
  return data;
};

export const getBarStacked2D = (
  rows: string[][],
  i: number,
): WithNextIndex<BarStacked2D> => {
  const result: BarStacked2D = {
    type: 'barStacked2D',
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'code':
      case 'scope':
      case 'size':
      case 'title':
      case 'unit':
      case 'subtitle':
      case 'description':
        result[key] = rows[i][1];
        break;
      case 'table':
        result.data = getBarStacked2DData(rows, i);
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};
