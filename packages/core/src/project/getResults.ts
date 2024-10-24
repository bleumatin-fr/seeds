import { getBarStacked2D } from './resultsUtils/barChart';
import { getBarStacked1D } from './resultsUtils/barChart1D';
import { getBarSingle1D } from './resultsUtils/barSingle1D';
import { getTable } from './resultsUtils/table';
import {
  Bar1D,
  Bar1DBar,
  Bar1DData,
  GlobalScore,
  Indicator,
  Indicator2Values,
  Nav,
  Pie1D,
  Pie1DData,
  Result,
  ResultsConfiguration,
  ScoreCard,
  Subtitle,
  TextResult,
  Title,
  Treemap,
  TreemapData,
} from './types';

type WithNextIndex<T> = { result: T; nextIndex: number };

const getScoreCard = (
  rows: string[][],
  i: number,
): WithNextIndex<ScoreCard> => {
  const result: ScoreCard = {
    type: 'scoreCard',
  };
  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case 'abacus':
        const letters = rows[i].slice(1);
        const scores = [...rows[i + 1].slice(1), '0'];
        const primaryColors = rows[i + 2].slice(1);
        const secondaryColors = rows[i + 3].slice(1);
        let colors = [];
        for (let i = 0; i < primaryColors.length; i++) {
          colors.push({
            primary: primaryColors[i],
            secondary: secondaryColors[i],
          });
        }
        result.abacus = {
          letters: letters.filter((v) => !!v),
          scores: scores.filter((v) => !!v),
          colors: colors.filter((v) => !!v),
        };
        break;
      case '':
        break;
      case 'displayData':
        result.displayData = rows[i][1] === 'yes' ? true : false;
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
      case 'code':
      case 'scope':
      case 'title':
      case 'level':
      case 'score':
        result[key] = rows[i][1];
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getIndicator = (
  rows: string[][],
  i: number,
): WithNextIndex<Indicator> => {
  const result: Indicator = {
    type: 'indicator',
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'code':
      case 'scope':
      case 'title':
      case 'number':
      case 'unit':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getIndicator2Values = (
  rows: string[][],
  i: number,
): WithNextIndex<Indicator2Values> => {
  const result: Indicator2Values = {
    type: 'indicator2Values',
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'code':
      case 'scope':
      case 'title':
      case 'displayed_number1':
      case 'displayed_unit1':
      case 'number1':
      case 'unit1':
      case 'displayed_number2':
      case 'displayed_unit2':
      case 'number2':
      case 'unit2':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getTreemapData = (
  rows: string[][],
  i: number,
  unit: string | undefined,
): TreemapData => {
  const getRowData = (i: number) => {
    return {
      sector: rows[i][1],
      sectorColor: rows[i][2],
      subSector: rows[i][3],
      subSectorColor: rows[i][4],
      value: rows[i][5],
    };
  };

  const isNewSector = (data: TreemapData, sector: string) => {
    return (
      data.children?.map((v) => v.name).filter((v) => v === sector).length === 0
    );
  };

  let data: TreemapData = {
    name: 'emissions',
    color: 'black',
    children: [],
  };

  while (rows[i] && rows[i].length > 0 && rows[i][1] && rows[i][1].length > 0) {
    const rowData = getRowData(i);
    if (isNewSector(data, rowData.sector)) {
      data.children?.push({
        name: rowData.sector,
        color: rowData.sectorColor,
      });
      if (data.children && data.children.length > 0) {
        if (rowData.subSector && rowData.subSector.length > 0) {
          //new sector contains subsectors
          data.children[data.children.length - 1].children = [];
        } else {
          //new sector doesn't contain subsectors : we allocate it the value
          data.children[data.children.length - 1].loc = parseFloat(
            rowData.value,
          );
          data.children[data.children.length - 1].unit = unit;
        }
      }
    }
    if (
      rowData.subSector &&
      rowData.subSector.length > 0 &&
      data.children &&
      data.children.length > 0
    ) {
      data.children[data.children.length - 1].children?.push({
        name: rowData.subSector,
        color: rowData.subSectorColor,
        loc: parseFloat(rowData.value),
        unit: unit,
      });
    }
    i += 1;
  }
  return data;
};

const getTreemap = (rows: string[][], i: number): WithNextIndex<Treemap> => {
  const result: Treemap = {
    type: 'treemap',
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
        result.data = getTreemapData(rows, i, result.unit);
        break;

      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getNav = (rows: string[][], i: number): WithNextIndex<Nav> => {
  let result: Nav = {
    type: 'nav',
    scope: '',
    data: [],
  };
  let links_icons: string[] = [];
  let titles: string[] = [];
  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'scope':
        result[key] = rows[i][1];
        break;
      case 'links/icons':
        links_icons = rows[i][1].split(', ');
        break;
      case 'titles':
        titles = rows[i][1].split(', ');
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  if (links_icons.length === titles.length) {
    links_icons.map((link_icon, i) => {
      result.data.push({
        link: link_icon,
        icon: link_icon,
        title: titles[i],
      });
    });
  } else {
    console.error('Results / Nav : numbers of titles and links differ');
  }
  return {
    result,
    nextIndex: i,
  };
};

const getTitle = (rows: string[][], i: number): WithNextIndex<Title> => {
  const result: Title = {
    type: 'title',
  };
  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'text':
      case 'icon':
      case 'scope':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getSubtitle = (rows: string[][], i: number): WithNextIndex<Subtitle> => {
  const result: Subtitle = {
    type: 'subtitle',
  };

  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'text':
      case 'scope':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getText = (rows: string[][], i: number): WithNextIndex<TextResult> => {
  const result: TextResult = {
    type: 'text',
  };
  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'text':
      case 'scope':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getGlobalScore = (
  rows: string[][],
  i: number,
): WithNextIndex<GlobalScore> => {
  const result: GlobalScore = {
    type: 'globalScore',
  };
  while (rows[i] && rows[i].length > 0 && !rows[i][0].includes('##')) {
    const key: string = rows[i][0];
    switch (key) {
      case '':
        break;
      case 'text':
      case 'title':
      case 'subtitle':
      case 'score':
      case 'scope':
        result[key] = rows[i][1];
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getBar1DData = (
  rows: string[][],
  i: number,
): { bars: Bar1DBar[]; data: Bar1DData[] } => {
  let bars: Bar1DBar[] = [];
  const columnNames = rows[i]
    .slice(3)
    .slice(
      0,
      rows[i].findIndex((e) => e.length === 0),
    )
    .filter((e) => e.length > 0);

  let data: Bar1DData[] = columnNames.map((columnName: string) => {
    return { name: columnName };
  });
  i++;
  let k = 0;
  while (rows[i] && rows[i].length > 0 && rows[i][1].length > 0) {
    const row = rows[i].slice(1);
    const rowName = row[0];
    const color = row[1];
    bars.push({ name: rowName, color });
    let j = 2;
    while (row[j] && row[j].toString().length > 0) {
      data[j - 2][rowName] = Number(row[j]);
      j++;
    }
    i++;
  }
  return { bars, data };
};

const getBar1D = (rows: string[][], i: number): WithNextIndex<Bar1D> => {
  let result: Bar1D = {
    type: 'bar1D',
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
        const { data, bars } = getBar1DData(rows, i);
        result.data = data;
        result.bars = bars;
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getPie1DData = (rows: string[][], i: number): Pie1DData[] => {
  let data: Pie1DData[] = [];
  i = i + 1;
  while (rows[i] && rows[i].length > 0 && rows[i][1].length > 0) {
    const row = rows[i];
    let rowData: Pie1DData = {
      name: row[1],
      fill: row[2],
      value: parseFloat(row[3]),
    };
    if (row.length >= 5) {
      rowData.link = row[4].length > 0 ? `#${row[4]}` : '';
    }
    data.push(rowData);
    i += 1;
  }
  return data;
};

const getPie1D = (rows: string[][], i: number): WithNextIndex<Pie1D> => {
  const result: Pie1D = {
    type: 'pie1D',
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
        result.data = getPie1DData(rows, i);
        break;
      case 'display':
        result.display = rows[i][1] === 'yes' ? true : false;
        break;
    }
    i++;
  }
  return {
    result,
    nextIndex: i,
  };
};

const getResult = (
  rows: string[][],
  i: number,
): WithNextIndex<Result> | null => {
  const resultType = rows[i][0].split('##')[1];
  switch (resultType) {
    case 'ScoreCard':
      return getScoreCard(rows, i + 1);
    case 'Indicator':
      return getIndicator(rows, i + 1);
    case 'Indicator2Values':
      return getIndicator2Values(rows, i + 1);
    case 'Treemap':
      return getTreemap(rows, i + 1);
    case 'Nav':
      return getNav(rows, i + 1);
    case 'Subtitle':
      return getSubtitle(rows, i + 1);
    case 'Title':
      return getTitle(rows, i + 1);
    case 'GlobalScore':
      return getGlobalScore(rows, i + 1);
    case 'Text':
      return getText(rows, i + 1);
    case 'Pie1D':
      return getPie1D(rows, i + 1);
    case 'BarStacked2D':
      return getBarStacked2D(rows, i + 1);
    case 'BarStacked1D':
      return getBarStacked1D(rows, i + 1);
    case 'BarSingle1D':
      return getBarSingle1D(rows, i + 1);
    case 'Table':
      return getTable(rows, i + 1);
    case 'Bar1D':
      return getBar1D(rows, i + 1);
    case 'Actions':
      return null;
    default:
      console.error(`Unsupported result type : ${resultType}`);
      return null;
  }
};

const getResultsFromRows = (rows: string[][]): Result[] => {
  let i = 0;
  let results: Result[] = [];
  while (i < rows.length) {
    if (rows[i].length > 0 && rows[i][0] && rows[i][0].includes('##')) {
      const data = getResult(rows, i);
      if (!data) {
        i++;
        continue;
      }
      i = data.nextIndex;
      results.push(data.result);
      //   const { code, ...result } = data.result;
      //   results[data.resultKey as keyof typeof results]![code] = result;
    } else {
      i++;
    }
  }
  return results;
};

export const getResults = async (
  rows: any[][],
  config: ResultsConfiguration,
): Promise<Result[]> => {
  const data = getResultsFromRows(rows);
  return data.filter((result) => !!result);
};
