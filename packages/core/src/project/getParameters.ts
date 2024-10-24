import {
  Operations,
  Parameter,
  ParametersConfiguration,
  Sector,
} from './types';

const getNewSectors = (
  sectorsIndex: number[],
  row: any[],
  previousRow: any[],
) => {
  const firstDifferent = !previousRow
    ? 0
    : sectorsIndex.findIndex(
        (sectorIndex) => row[sectorIndex] !== previousRow[sectorIndex],
      );
  if (firstDifferent === -1) {
    return [];
  }
  const newSectorsIndex: number[] = [];
  for (let i: number = firstDifferent; i < sectorsIndex.length; i++) {
    newSectorsIndex.push(i);
    //   if (row[sectorsIndex[i]].length > 0) {
    //   newSectorsIndex.push(i);
    // } else {
    //   break;
    // }
  }
  return newSectorsIndex;
};

const addSector = (
  data: Sector[],
  name: string,
  color: string,
  icon: string,
  sectorIndex: number,
) => {
  if (sectorIndex === 0) {
    data.push({
      information: {
        name: name,
        color: color,
        icon: icon,
      },
      sectors: [],
      parameters: [],
    });
  } else {
    addSector(
      data[data.length - 1].sectors,
      name,
      color,
      icon,
      sectorIndex - 1,
    );
  }
  return data;
};

const addSectors = (
  data: Sector[],
  row: any[],
  newSectorsIndex: number[],
  colorIndex: number[],
  config: ParametersConfiguration,
) => {
  // if (newSectorsIndex.length === 0) {
  //   return data;
  // }
  newSectorsIndex.forEach((sectorIndex) => {
    const name = row[config.columnIndexes.sectors[sectorIndex]];
    let color: string | null = null;
    let icon: string | null = null;
    try {
      switch (sectorIndex) {
        case 0:
          color = config.sectors[colorIndex[0]].color;
          icon = config.sectors[colorIndex[0]].icon || '';
          break;
        case 1:
          const categoryColors = config.sectors[colorIndex[0]].children;
          if (!categoryColors) {
            color = '#ff0000';
          } else {
            color = categoryColors[colorIndex[1]]?.color;
          }
          break;
      }
    } catch (e) {}
    addSector(data, name, color || '', icon || '', sectorIndex);
  });
  return data;
};

const getParameterDepth = (
  newSectorsIndex: number[],
  row: string[],
  config: ParametersConfiguration,
) => {
  const lastNotEmpty =
    config.columnIndexes.sectors.findIndex(
      (sectorIndex) => row[sectorIndex]?.length === 0,
    ) - 1;

  const lastIndex = config.columnIndexes.sectors.length - 1;
  return newSectorsIndex.length > 0
    ? newSectorsIndex[newSectorsIndex.length - 1]
    : lastNotEmpty > -1
    ? lastNotEmpty
    : lastIndex;
};

const notEscapedComma = /(?<!\\),/;

const getOperations = (config: ParametersConfiguration): Operations => {
  return {
    value: (row: any[], value: any, config: ParametersConfiguration) => {
      try {
        let type: string = row[config.columnIndexes.parameters.type];

        if (config.types && config.types[type.trim()]) {
          type = config.types[type.trim()];
        }

        switch (type) {
          case 'list':
          case 'checkbox':
          case 'template':
            return value.split(notEscapedComma).map((v: string) => v.trim());
          default:
            return value;
        }
      } catch (e) {
        console.error(1,  value, e);
      }
    },
    display: (row: any[], value: any, config: ParametersConfiguration) => {
      return row[config.columnIndexes.parameters.display] === 1;
    },

    possibleValues: (
      row: any[],
      value: any,
      config: ParametersConfiguration,
    ) => {
      try {
        return value.split(notEscapedComma).map((v: string) => v.trim());
      } catch (e) {
        console.error(2,  value, e);
      }
    },
    type: (row: any[], value: any, config: ParametersConfiguration) => {
      if (value) {
        try {
          if (config.types && config.types[value.trim()]) {
            return config.types[value.trim()];
          } else {
            return value;
          }
        } catch (e) {
          console.error(3, value, e);
        }
      }
      throw new Error(`Parameter type "${value}" unknown`);
    },
  };
};

const addParameter = (
  data: Sector[],
  row: any[],
  parameterDepth: number,
  rowIndex: number,
  config: ParametersConfiguration,
  filter: (parameter: Parameter) => boolean = () => true,
) => {
  if (parameterDepth === 0) {
    let parameter: { [key: string]: any } = {
      index: rowIndex,
    };
    const operations = getOperations(config);
    Object.entries(config.columnIndexes.parameters).forEach(([key, index]) => {
      const operation = operations[key];
      try {
        parameter[key] = operation
          ? operation(row, row[index], config)
          : row[index];
      } catch (e: unknown) {
        if (typeof e === 'string') {
          parameter.error = e;
        } else if (e instanceof Error) {
          parameter.error = e.message;
        } else {
          parameter.error = 'Unknown error';
        }
      }
    });

    // TO DO : get parameters info depending on parameter type (radio, input, ...)
    if (filter(parameter as Parameter)) {
      try {
        data[data.length - 1].parameters.push(parameter as Parameter);
      } catch (e) {}
    }
  } else {
    addParameter(
      data[data.length - 1].sectors,
      row,
      parameterDepth - 1,
      rowIndex,
      config,
      filter,
    );
  }
  return data;
};

const updateColorIndex = (colorIndex: number[], newSectorsIndex: number[]) => {
  if (newSectorsIndex.includes(0)) {
    colorIndex[0]++;
    colorIndex[1] = -1;
  }
  if (newSectorsIndex.includes(1)) {
    colorIndex[1]++;
  }
  return colorIndex;
};

const getParametersFromRows = (
  rows: any[][],
  config: ParametersConfiguration,
  filter: (parameter: Parameter) => boolean = () => true,
) => {
  let data: Sector[] = [];
  let colorIndex: number[] = [-1, -1];
  rows.forEach((row, i) => {
    // if (row[config.columnIndexes.sectors[0]].length > 0) {
    const newSectorsIndex = getNewSectors(
      config.columnIndexes.sectors,
      row,
      rows[i - 1],
    );
    colorIndex = updateColorIndex(colorIndex, newSectorsIndex);
    addSectors(data, row, newSectorsIndex, colorIndex, config);

    const parameterDepth = getParameterDepth(newSectorsIndex, row, config);
    addParameter(data, row, parameterDepth, i, config, filter);
    // }
  });
  return data;
};

const notEmpty = <TValue>(value: TValue): value is NonNullable<TValue> => {
  return value !== null && value !== undefined;
};

export const cleanUpSectors = (sectors: Sector[]): Sector[] => {
  return sectors
    .map((sector: Sector): Sector | null => {
      const cleanedUpSubSectors = cleanUpSectors(sector.sectors);
      const cleanedUpParameters = sector.parameters.filter(
        (parameter) => !!parameter.display,
      );
      if (
        cleanedUpSubSectors.length === 0 &&
        cleanedUpParameters.length === 0
      ) {
        return null;
      }
      return {
        ...sector,
        sectors: cleanedUpSubSectors,
        parameters: cleanedUpParameters,
      };
    })
    .filter(notEmpty);
};

export const getParameters = async (
  rows: any[][],
  config: ParametersConfiguration,
  filter: (parameter: Parameter) => boolean = () => true,
  skipCleanup: boolean = false,
): Promise<Sector[]> => {
  try {
    const data = getParametersFromRows(rows, config, filter);
    if (skipCleanup) return data;
    return cleanUpSectors(data);
  } catch (e) {
    console.error(e);
  }
  return Promise.resolve([]);
};
