import stc from 'string-to-color';
import {
  GlobalScore,
  Indicator,
  Indicator2Values,
  Pie1D,
  Pie1DData,
  Project,
  Result,
  ScoreCard,
  TableResult,
  Title,
} from '../project/types';

const humanize = (value: number, units: string[]) => {
  let unit = units.shift();
  let humanized = value;

  while (humanized > 1000 && units.length) {
    humanized /= 1000;
    unit = units.shift();
  }

  return `${humanized.toFixed(2)} ${unit}`;
};

const getGlobalScore = (
  projects: Project[],
  code: string,
  title: string,
  units: string[],
) => {
  const totalCo2 = projects.reduce((acc, project) => {
    const globalScore = project.results.find(
      (result) => result.type === 'indicator' && result.code === code,
    ) as Indicator;
    if (globalScore) return acc + parseFloat(globalScore?.number || '0');

    const globalScore2Values = project.results.find(
      (result) => result.type === 'indicator2Values' && result.code === code,
    ) as Indicator2Values;

    return acc + parseFloat(globalScore2Values?.number1 || '0');
  }, 0);

  return {
    type: 'globalScore',
    title,
    unit: units[0],
    score: humanize(totalCo2, units),
    scope: code,
  } as GlobalScore;
};

const getPie = (
  projects: Project[],
  coefficients: { id: string; value?: number }[],
  code: string,
  unit: string,
) => {
  const data: Pie1DData[] = projects.map((project) => {
    const globalScore = project.results.find(
      (result) => result.type === 'indicator' && result.code === code,
    ) as Indicator;

    const globalScore2Values = project.results.find(
      (result) => result.type === 'indicator2Values' && result.code === code,
    ) as Indicator2Values;

    const coefficient = coefficients.find(
      (coefficient) => coefficient.id === project._id.toString(),
    );

    return {
      name: `${project.model.singularName} - ${project.name}`,
      fill: stc(`${project.model.singularName} - ${project.name}`),
      value:
        parseFloat(globalScore?.number || globalScore2Values?.number1 || '0') *
        (coefficient?.value || 1),
      link: `./${project._id}`,
      coefficient: coefficient?.value,
    };
  });

  return {
    type: 'pie1D',
    title: 'Répartition des émissions par projet',
    unit: unit,
    data,
    scope: code,
  } as Pie1D;
};

const isCategory = (row: string[]) => {
  return row.slice(1).every((value) => !value);
};

const getCategoryNameOfValue = (data: any[][], valueName: string): string => {
  const valueIndex = data.findIndex((row) => row[0] === valueName);
  let categoryIndex = valueIndex - 1;

  while (categoryIndex >= 0 && !isCategory(data[categoryIndex])) {
    categoryIndex--;
  }

  if (categoryIndex < 0) {
    return '';
  }

  return data[categoryIndex][0];
};

const getTable = (projects: Project[], code: string): TableResult | null => {
  if (projects.length === 0) {
    return null;
  }
  const firstTableResult = projects[0].results.find(
    (result) => result.type === 'table' && result.code === code,
  ) as TableResult;

  if (
    !firstTableResult ||
    !firstTableResult.table ||
    !firstTableResult.table[0]
  ) {
    return null;
  }

  const numberOfColumns = firstTableResult.table[0].length;
  const headers = firstTableResult.table[0];

  const allCategories = projects.reduce((acc, project) => {
    const tableResult = project.results.find(
      (result) => result.type === 'table' && result.code === code,
    ) as TableResult;

    if (!tableResult || !tableResult.table) {
      return acc;
    }

    tableResult.table
      .slice(1)
      .filter(isCategory)
      .map((row) => row[0] as string)
      .forEach((category) => {
        if (!acc.includes(category)) {
          acc.push(category);
        }
      });

    return acc;
  }, [] as string[]);

  const allValues = projects.reduce((acc, project) => {
    const tableResult = project.results.find(
      (result) => result.type === 'table' && result.code === code,
    ) as TableResult;

    if (!tableResult || !tableResult.table) {
      return acc;
    }

    tableResult.table
      .slice(1)
      .filter((row) => !isCategory(row))
      .forEach((row, index, array) => {
        const valueName = row[0] as string;

        const categoryName = getCategoryNameOfValue(
          tableResult.table || [],
          valueName,
        );

        let categoryIndex = allCategories.indexOf(categoryName);
        if (categoryIndex < 0) {
          categoryIndex = allCategories.length;
          allCategories.push(categoryName);
        }
        const values = acc[categoryIndex] || [];

        const valueIndex = values.findIndex(
          (valueRow) => valueRow[0] === valueName,
        );
        if (valueIndex < 0) {
          if (!acc[categoryIndex]) {
            acc[categoryIndex] = [];
          }
          acc[categoryIndex].push(row);
          return;
        }

        row.slice(1).forEach((value, index) => {
          const leafValueAsString = acc[categoryIndex][valueIndex][index + 1];
          const matches = leafValueAsString.match(/(\d(?:\.\d+)?)+(.*)/);
          const unit = matches.length > 2 ? matches[2] : '';
          const leafValueAsNumber =
            matches.length > 1
              ? parseFloat(matches[1])
              : parseFloat(leafValueAsString);

          const thisValue = parseFloat(value) || 0;

          acc[categoryIndex][valueIndex][index + 1] = `${
            Math.round((leafValueAsNumber + thisValue) * 100) / 100
          }${unit}`;
        });
      });
    return acc;
  }, [] as any[][]);

  const data = allValues.reduce((acc, valueCategory, index) => {
    if (allCategories[index]) {
      const categoryLine = Array.from({ length: numberOfColumns });
      categoryLine[0] = allCategories[index];
      return [...acc, categoryLine, ...valueCategory];
    }
    return [...acc, ...valueCategory];
  }, []);

  return {
    type: 'table',
    title: firstTableResult.title,
    code,
    scope: code,
    description: firstTableResult.description,
    table: [headers, ...data],
  };
};

const resultsPicker = [
  () => {
    return {
      text: 'Émissions de gaz à effet de serre',
      icon: 'co2',
      type: 'title',
    } as Title;
  },
  (projects: Project[], coefficients: { id: string; value?: number }[]) => {
    const unit = projects[0]?.data?.mainIndicator?.unit;
    const title = projects[0]?.data?.mainIndicator?.title;
    const total = projects.reduce((acc, project) => {
      const coefficient = coefficients.find(
        (coefficient) => coefficient.id === project._id.toString(),
      );
      if (!coefficient?.value) return acc;

      return (
        acc +
        parseFloat(project.data?.mainIndicator?.number || 0) *
          coefficient?.value
      );
    }, 0);

    return {
      type: 'globalScore',
      title,
      score: `${Math.round(total).toString()} ${unit}`,
      scope: 'mainIndicator',
    } as GlobalScore;
  },
  (projects: Project[], coefficients: { id: string; value?: number }[]) => ({
    ...getPie(projects, coefficients, 'co2', 'tCO₂eq'),
    code: 'co2-pie',
  }),

  (projects: Project[], coefficients: { id: string; value?: number }[]) => {
    let result: Pie1D | null = null;

    result = projects.reduce((acc, project) => {
      const coefficient = coefficients.find(
        (coefficient) => coefficient.id === project._id.toString(),
      );

      if (!coefficient?.value) return acc;

      const data = project.data?.mainPie.data
        ?.reduce((acc: Pie1DData[], projectData: Pie1DData) => {
          let found = acc.find(
            (data) =>
              data.name.toLowerCase() === projectData.name.toLowerCase(),
          );
          if (!found) {
            found = projectData;
          } else {
            found = {
              ...found,
              value:
                found.value + projectData.value * (coefficient?.value || 1),
            };
          }
          return [
            ...acc.filter((data) => data.name !== projectData.name),
            found,
          ];
        }, (acc?.data || []) as Pie1DData[])
        .filter((data: any) => data !== null)
        .map((data: any) => {
          data.value = Math.round(data.value);
          return data;
        }) as Pie1DData[];

      return {
        type: 'pie1D',
        title: 'Répartition des émissions par catégorie',
        unit: project.data?.mainPie.unit,
        scope: 'mainPie',
        data,
      };
    }, {} as Pie1D);

    return result;
  },
];

type CategoryData = {
  code: string;
  icon: string;
  text: string;
};

const bioAndRessourceData: { biodiv: CategoryData; ressources: CategoryData } =
  {
    biodiv: {
      code: 'biodiv',
      icon: 'biodiv',
      text: 'Biodiversité',
    },
    ressources: {
      code: 'ressources',
      icon: 'ressources',
      text: 'Ressources',
    },
  };

const getScoreCard = (project: Project, config: CategoryData) => {
  const scoreCard = project.results.find(
    (result) =>
      'code' in result &&
      result.code === config.code &&
      result.type === 'scoreCard' &&
      result.displayData === true,
  ) as ScoreCard | undefined;
  if (scoreCard) {
    scoreCard.title = project.name;
  }
  return scoreCard;
};

const getBiodivOrRessourcesResults = (
  projects: Project[],
  config: CategoryData,
) => {
  const scoreCards = projects
    .map((project) => getScoreCard(project, config))
    .filter((r) => r !== undefined);

  if (scoreCards.length > 0) {
    return [
      {
        text: config.text,
        icon: config.icon,
        type: 'title',
      } as Title,
      ...scoreCards,
    ];
  }
  return [] as Result[];
};

export const getReportResults = (
  projects: Project[],
  coefficients: { id: string; value?: number }[],
): Result[] => {
  const results: Result[] = resultsPicker.map((picker) =>
    picker(projects, coefficients),
  );
  const biodivResults: Result[] = getBiodivOrRessourcesResults(
    projects,
    bioAndRessourceData.biodiv,
  ) as Result[];
  const ressourcesResults: Result[] = getBiodivOrRessourcesResults(
    projects,
    bioAndRessourceData.ressources,
  ) as Result[];

  return [...results, ...biodivResults, ...ressourcesResults];
};
