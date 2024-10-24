import { TableResult } from '../types';

type WithNextIndex<T> = { result: T; nextIndex: number };

const getTableData = (rows: string[][], i: number): any[][] => {
  const lastIndex = rows.slice(i).findIndex((row) => !row[1]);
  const tableRows = rows.slice(i, i + lastIndex);
  const maxNotEmptyRow = tableRows.reduce((max, row) => {
    const currentMax = row.slice(1).findIndex((value) => !value) + 1;
    return currentMax > max ? currentMax : max;
  }, 0);
  const results = tableRows.map((row) => row.slice(1, maxNotEmptyRow));
  return results;
};

export const getTable = (
  rows: string[][],
  i: number,
): WithNextIndex<TableResult> => {
  const result: TableResult = {
    type: 'table',
    table: [],
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'code':
      case 'scope':
      case 'description':
      case 'title':
        result[key] = rows[i][1];
        break;
      case 'table':
        result.table = getTableData(rows, i);
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};
