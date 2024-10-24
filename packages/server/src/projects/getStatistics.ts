import {
  BarSingle1D,
  BarStacked1D,
  GlobalScore,
  Indicator,
  Parameter,
  Pie1D,
  Project,
  Result,
  ScoreCard,
  Sector,
  spreadsheet,
  Value,
} from '@arviva/core';
import { format, isValid, parse, parseISO } from 'date-fns';
import xlsx from 'xlsx';

const uniqueBy = (array: any[], key: string) => {
  return array.filter((item, index, self) => {
    return (
      index ===
      self.findIndex((t) => {
        return t[key].toString() === item[key].toString();
      })
    );
  });
};

const keyify = (key: string) =>
  (key || '')
    .replace(/\s/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();

interface Line {
  id: string;
  categories: string[];
  label: string;
  values: string[];
}

type ParameterWithCategories = Parameter & { categories: string[] };

const equalizeArrayLength = (array: any, key: string) => {
  const maxNumberOfKey = array.reduce(
    (max: number, item: any) =>
      item[key].length > max ? item[key].length : max,
    0,
  );

  array.forEach((item: any) => {
    while (item[key].length < maxNumberOfKey) {
      item[key].push('');
    }
  });
};

const flattenParameters = (
  sectors: Sector[],
  topLevelSectors: Sector[] = [],
): ParameterWithCategories[] => {
  const parameters = sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors || [], [
      ...topLevelSectors,
      sector,
    ]);

    return [
      ...allParameters,
      ...sector.parameters.map((parameter) => ({
        ...parameter,
        categories: [
          ...topLevelSectors.map((sector) => sector.information.name),
          sector.information.name,
        ],
      })),
      ...subParameters,
    ];
  }, [] as ParameterWithCategories[]);

  equalizeArrayLength(parameters, 'categories');

  return parameters;
};

const getProjectIdentifyingInformation = (project: Project) => {
  return [
    project._id.toString(),
    project.name,
    project.completionRate,
    project.createdAt.toISOString().split('T')[0],
    project.createdAt.toISOString().split('T')[1].substring(0, 8),
    project.updatedAt.toISOString().split('T')[0],
    project.updatedAt.toISOString().split('T')[1].substring(0, 8),
  ];
};

const getProjectUserInformation = (project: Project) => {
  const user = project.users.find((user) => user.role === 'owner')?.user;
  return [
    user._id.toString(),
    user.firstName,
    user.lastName,
    user.email,
    user.structure,
  ];
};

const getParametersIds = (parameters: Parameter[]) => {
  return parameters
    .reduce((ids, parameter) => {
      if (!parameter.id) {
        return ids;
      }
      if (parameter.type === 'building') {
        return [...ids, `${parameter.id}_energy`, `${parameter.id}_public`];
      }
      return [...ids, `${parameter.id?.toString()}_${parameter.type}`];
    }, [] as string[])
    .map(keyify);
};

const getParametersLabels = (parameters: Parameter[]) => {
  return parameters.reduce((labels, parameter) => {
    if (!parameter.id) {
      return labels;
    }
    return [...labels, parameter.name || ''];
  }, [] as string[]);
};

const getParameters = (parameters: Parameter[], parameterIds: string[]) => {
  const parametersData = [];

  for (const parameter of parameters) {
    if (!parameter.id) {
      continue;
    }
    if (parameter.type === 'building') {
      const energyIndex = parameterIds.indexOf(
        keyify(`${parameter.id}_energy`),
      );
      const publicIndex = parameterIds.indexOf(
        keyify(`${parameter.id}_public`),
      );
      const [energyValue, publicValue] = (parameter.value || '')
        .toString()
        .split('|||');
      parametersData[energyIndex] = energyValue;
      parametersData[publicIndex] = publicValue;
    } else {
      const index = parameterIds.indexOf(
        keyify(`${parameter.id?.toString()}_${parameter.type}`),
      );
      if (parameter.type === 'date') {
        parametersData[index] = stringifyDate(parameter.value);
      } else if (typeof parameter.value === 'number') {
        parametersData[index] = parameter.value;
      } else if (Array.isArray(parameter.value)) {
        parametersData[index] = parameter.value
          .map((value) => value.toString().replaceAll(/;/g, ','))
          .join(';');
      } else {
        parametersData[index] = parameter.value
          ?.toString()
          .replaceAll(/;/g, ',');
      }
    }
  }

  return parametersData;
};

const getResultsIds = (results: Result[]) => {
  return results
    .reduce((ids, result) => {
      if (!(result as any).code) {
        return ids;
      }
      switch (result.type) {
        case 'scoreCard':
          return [
            ...ids,
            `${result.scope}_${(result as any).code}_score`,
            `${result.scope}_${(result as any).code}_level`,
          ];
        case 'indicator':
          return [
            ...ids,
            `${result.scope}_${(result as any).code}_value`,
            `${result.scope}_${(result as any).code}_unit`,
          ];
        case 'globalScore':
          return [...ids, `${result.scope}_${(result as GlobalScore).code}`];
        case 'indicator2Values':
          return [
            ...ids,
            `${result.scope}_${(result as any).code}_1`,
            `${result.scope}_${(result as any).code}_2`,
          ];
        case 'pie1D':
          if (!(result as Pie1D).data) {
            return ids;
          }
          return [
            ...ids,
            ...(result as Pie1D).data!.map(
              (data) => `${result.scope}_${(result as any).code}_${data.name}`,
            ),
          ];
        case 'barStacked1D':
          if (!(result as BarStacked1D).data) {
            return ids;
          }
          return [
            ...ids,
            ...(result as BarStacked1D).data!.data.map(
              (data) =>
                `${result.scope}_${(result as any).code}_${data.categoryName}`,
            ),
          ];
        case 'barSingle1D':
          if (!(result as BarSingle1D).data) {
            return ids;
          }
          return [
            ...ids,
            ...(result as BarSingle1D).data!.data.map(
              (data) =>
                `${result.scope}_${(result as any).code}_${data.categoryName}`,
            ),
          ];
        default:
          return [...ids, `${result.scope}_${(result as any).code}`];
      }
    }, [] as string[])
    .map(keyify);
};

const numberifyIfPossible = (value: string | undefined) => {
  if (typeof value === 'undefined') {
    return value;
  }
  return (+value).toString() === value ? +value : value;
};

const getResults = (results: Result[], resultIds: string[]) => {
  const resultsData = [];

  for (const result of results) {
    if (!(result as any).code) {
      continue;
    }
    switch (result.type) {
      case 'scoreCard':
        const scoreIndex = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_score`),
        );
        const levelIndex = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_level`),
        );
        resultsData[scoreIndex] = (result as ScoreCard).score;
        resultsData[levelIndex] = (result as ScoreCard).level;
        break;
      case 'indicator':
        const valueIndex = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_value`),
        );
        const unitIndex = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_unit`),
        );
        resultsData[valueIndex] = numberifyIfPossible(
          (result as Indicator).number,
        );
        resultsData[unitIndex] = (result as Indicator).unit;
        break;
      case 'globalScore':
        const globalScoreIndex = resultIds.indexOf(
          keyify(`${result.scope}_${(result as GlobalScore).code}` || ''),
        );
        resultsData[globalScoreIndex] = (result as GlobalScore).score;
        break;
      case 'indicator2Values':
        const value1Index = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_1`),
        );
        const value2Index = resultIds.indexOf(
          keyify(`${result.scope}_${(result as any).code}_2`),
        );
        resultsData[value1Index] = numberifyIfPossible((result as any).value1);
        resultsData[value2Index] = numberifyIfPossible((result as any).value2);
        break;
      case 'pie1D':
        if (!(result as Pie1D).data) {
          break;
        }
        (result as Pie1D).data!.forEach((data) => {
          const index = resultIds.indexOf(
            keyify(`${result.scope}_${(result as any).code}_${data.name}`),
          );
          resultsData[index] = data.value;
        });
        break;
      case 'barStacked1D':
        if (!(result as BarStacked1D).data) {
          break;
        }
        (result as BarStacked1D).data!.data.forEach((data) => {
          const index = resultIds.indexOf(
            keyify(
              `${result.scope}_${(result as any).code}_${data.categoryName}`,
            ),
          );
          resultsData[index] = data.score;
        });
        break;
      case 'barSingle1D':
        if (!(result as BarSingle1D).data) {
          break;
        }
        (result as BarSingle1D).data!.data.forEach((data) => {
          const index = resultIds.indexOf(
            keyify(
              `${result.scope}_${(result as any).code}_${data.categoryName}`,
            ),
          );
          resultsData[index] = numberifyIfPossible(data.value);
        });
      default:
        console.log('result not supported', result);
    }
  }
  return resultsData;
};

const transposeArray = (matrix: any[][]) => {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
};

export const getStatisticsSpreadsheet = async (
  projects: Project[],
  transpose: boolean = false,
) => {
  const models = uniqueBy(
    projects.map((project: Project) => project.model),
    '_id',
  );

  const statSpreadSheetId = await spreadsheet.create();
  if (!statSpreadSheetId) {
    throw new Error('Unable to create a new spreadsheet');
  }

  for (const model of models) {
    const projectsOfModel = projects.filter(
      (project) => project.model._id.toString() === model._id.toString(),
    );

    if (projectsOfModel.length === 0) {
      continue;
    }

    const sheetName = model.name;

    await spreadsheet.createSheets(statSpreadSheetId, [sheetName]);

    let data: any[][] = [];

    const identifyingInformation = [
      'Id',
      'Nom',
      'Taux de complétion',
      'Jour de création',
      'Heure de création',
      'Jour de mise à jour',
      'Heure de mise à jour',
    ].map(keyify);

    const userInformation = [
      'User Id',
      'Prénom',
      'Nom',
      'Email',
      'Structure',
    ].map(keyify);

    const parameterIds = getParametersIds(
      flattenParameters(projectsOfModel[0].sectors),
    );
    const parameterLabels = getParametersLabels(
      flattenParameters(projectsOfModel[0].sectors),
    );

    const resultIds = getResultsIds(projectsOfModel[0].results);

    data[0] = [
      ...identifyingInformation.map(() => keyify('Information')),
      ...userInformation.map(() => keyify('Utilisateur')),
      ...parameterIds.map(() => keyify('Paramètre')),
      ...resultIds.map(() => keyify('Résultat')),
    ];

    data[1] = [
      ...identifyingInformation.map(() => ''),
      ...userInformation.map(() => ''),
      ...parameterLabels.map((label) => label),
      ...resultIds.map((resultId) => ''),
    ];

    data[2] = [
      ...identifyingInformation,
      ...userInformation,
      ...parameterIds.map((parameterId) => parameterId),
      ...resultIds.map((resultId) => resultId),
    ];

    data = [
      ...data,
      ...projectsOfModel.map((project, projectIndex) => {
        const projectIdentifyingInformation =
          getProjectIdentifyingInformation(project);
        const projectUserInformation = getProjectUserInformation(project);
        const projectParameters = getParameters(
          flattenParameters(project.sectors),
          parameterIds,
        );
        const projectResults = getResults(project.results, resultIds);
        return [
          ...projectIdentifyingInformation,
          ...projectUserInformation,
          ...projectParameters,
          ...projectResults,
        ];
      }),
    ];

    const nbOfColumns = data[0].length;
    for (const row of data) {
      if (row.length < nbOfColumns) {
        row.push(...Array(nbOfColumns - row.length).fill(undefined));
      }
    }

    if (transpose) {
      const transposedData = transposeArray(data);
      const range = `${sheetName}!A1:${xlsx.utils.encode_col(
        transposedData[0].length - 1,
      )}${transposedData.length}`;
      await spreadsheet.write(statSpreadSheetId, range, transposedData);
    } else {
      const range = `${sheetName}!A1:${xlsx.utils.encode_col(
        data[0].length - 1,
      )}${data.length}`;

      await spreadsheet.write(statSpreadSheetId, range, data);
    }
  }
  await spreadsheet.removeSheetsByIndex(statSpreadSheetId, [0]);

  return statSpreadSheetId;
};

const stringifyDate = (value: Value): string | undefined => {
  if (!value) {
    return undefined;
  }

  const inputFormats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    `ISO`,
    'STANDARD',
    `EEE MMM dd yyyy HH:mm:ss 'GMT'XXX (zzzz)`,
    `EEE MMM dd yyyy`,
  ];

  for (const inputFormat of inputFormats) {
    try {
      let date: Date;
      if (inputFormat === 'ISO') {
        date = parseISO(value?.toString());
      } else if (inputFormat === 'STANDARD') {
        date = new Date(value?.toString());
      } else {
        date = parse(value?.toString(), inputFormat, new Date());
      }
      if (isValid(date)) {
        return format(date, 'yyyy-MM-dd');
      }
    } catch (e) {}
  }

  return undefined;
};
