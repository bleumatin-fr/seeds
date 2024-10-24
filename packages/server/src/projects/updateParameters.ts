import {
  ParameterInput,
  Project as ProjectType,
  spreadsheet,
} from '@arviva/core';
import { format, isValid } from 'date-fns';
import { intToExcelCol } from 'excel-column-name';
import {
  DetailedCellError,
  ExportedCellChange,
  HyperFormula,
  SerializedNamedExpression,
} from 'hyperformula';
import { HydratedDocument } from 'mongoose';
import xlsx, { CellObject, WorkBook } from 'xlsx';
import Project from './model';
import {
  refreshActions,
  refreshParameters,
  refreshResults,
} from './refreshProject';

const convertCellToString = (cell: CellObject): any => {
  if (cell.f) {
    return `=${cell.f}`
      .replace(/CONCAT\(/g, 'CONCATENATE(')
      .replace(/FALSE/g, 'FALSE()')
      .replace(/TRUE/g, 'TRUE()');
  }
  return cell.v;
};

export const getSheetsArrayFromWorkbook = (workbook: WorkBook) => {
  const workbookData: { [key: string]: any } = {};

  Object.keys(workbook.Sheets).forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    if (!workbookData[sheetName]) {
      workbookData[sheetName] = [];
    }
    Object.keys(worksheet)
      .filter((key) => !key.startsWith('!'))
      .forEach((cellAddress) => {
        const cell: CellObject = worksheet[cellAddress];
        const { r: row, c: col } = xlsx.utils.decode_cell(cellAddress);
        if (!workbookData[sheetName][row]) {
          workbookData[sheetName][row] = [];
        }
        workbookData[sheetName][row][col] = convertCellToString(cell);
      });
  });

  Object.keys(workbookData).forEach((sheetName, sheetIndex) => {
    const sheetData = workbookData[sheetName];
    if (!Array.isArray(sheetData)) {
      return;
    }
    for (let i = 0; i < sheetData.length; i++) {
      if (!Array.isArray(sheetData[i])) {
        sheetData[i] = [];
      }
    }
  });
  return workbookData;
};

const errorsCodes: { [key: string]: number } = {
  '#DIV/0!': 0x07,
  '#N/A': 0x2a,
  '#NAME?': 0x1d,
  '#NULL!': 0x00,
  '#NUM!': 0x24,
  '#REF!': 0x17,
  '#VALUE!': 0x0f,
  '#GETTING_DATA': 0x2b,
};

export const updateParameters = async (
  project: HydratedDocument<ProjectType>,
  parameterChanges: ParameterInput[],
): Promise<HydratedDocument<ProjectType>> => {
  console.time('updateParameters');
  const config = project.model.config;

  if (!parameterChanges || !parameterChanges.length) {
    return project;
  }
  const filePath = spreadsheet.getFilePath(project.spreadsheetId);

  let workbook = xlsx.readFile(filePath, {
    cellFormula: true,
    sheetStubs: true,
  });

  const namedExpressions: SerializedNamedExpression[] =
    workbook.Workbook?.Names?.map(({ Name, Ref, Sheet }) => {
      return {
        name: Name,
        expression: Ref,
        scope: Sheet,
      };
    }).filter(
      (namedExpression, index, array) =>
        array.findIndex((ne) => ne.name === namedExpression.name) === index,
    ) || [];

  const sheetsArray = getSheetsArrayFromWorkbook(workbook);

  const hf = HyperFormula.buildFromSheets(
    sheetsArray,
    {
      licenseKey: 'gpl-v3',
      useArrayArithmetic: true,
      smartRounding: true,
      useColumnIndex: true,
      precisionRounding: 10,
      precisionEpsilon: 1e-10,
      dateFormats: ['DD/MM/YYYY'],
    },
    namedExpressions,
  );

  const parametersSheetName = config.parameters.range.split('!')[0];
  const parametersSheetIndex = hf.getSheetId(parametersSheetName);
  if (typeof parametersSheetIndex === 'undefined') {
    throw new Error(`Could not find sheet ${parametersSheetName}`);
  }

  const parameterIndexes = sheetsArray[parametersSheetName].reduce(
    (indexes: { [key: string]: number }, row: any[], index: number) => {
      const parameterName = row[config.parameters.columnIndexes.parameters.id];
      indexes[`${parameterName}`] = index - 1;
      return indexes;
    },
    {},
  );

  const changes = hf.batch(() => {
    for (const change of parameterChanges) {
      const row =
        change.type === 'index' ? change.index : parameterIndexes[change.id];
      if (typeof row !== 'number') {
        continue;
      }
      let preparedValues: string | number | Date | undefined;
      if (Array.isArray(change.value)) {
        preparedValues = change.value.join(',');
      } else if (typeof change.value === 'number') {
        preparedValues = change.value;
      } else if (isValid(change.value)) {
        preparedValues = `'${format(change.value as Date, 'dd/MM/yyyy')}`;
      } else {
        preparedValues = change.value;
      }
      const cellAddress = {
        sheet: parametersSheetIndex,
        col: config.parameters.columnIndexes.parameters.value,
        row: row + 1,
      };
      if (hf.doesCellHaveFormula(cellAddress)) {
        continue;
      }
      hf.setCellContents(cellAddress, preparedValues);
    }
  });

  const exportedCellChange = changes.filter(
    (change) => change instanceof ExportedCellChange,
  ) as ExportedCellChange[];
  for (const change of exportedCellChange) {
    const sheetName = workbook.SheetNames[change.address.sheet];
    const address = `${intToExcelCol(change.address.col + 1)}${
      change.address.row + 1
    }`;

    if (!workbook.Sheets[sheetName][address]) {
      workbook.Sheets[sheetName][address] = {
        t:
          change.newValue instanceof Date
            ? 'd'
            : change.newValue instanceof Number
            ? 'n'
            : 's',
      };
    }

    if (change.newValue instanceof DetailedCellError) {
      workbook.Sheets[sheetName][address].t = 'e';
      workbook.Sheets[sheetName][address].v =
        errorsCodes[change.newValue.value] || 0x0f;
      workbook.Sheets[sheetName][address].w = change.newValue.value;
    } else if (
      change.newValue === null ||
      change.newValue === undefined ||
      change.newValue === ''
    ) {
      workbook.Sheets[sheetName][address].v = undefined;
    } else {
      switch (workbook.Sheets[sheetName][address].t) {
        case 'n':
          if (
            typeof change.newValue === 'string' &&
            !Number.isFinite(change.newValue)
          ) {
            workbook.Sheets[sheetName][address].t = 's';
            workbook.Sheets[sheetName][address].v = change.newValue;
            workbook.Sheets[sheetName][address].w = change.newValue;
            break;
          }
          workbook.Sheets[sheetName][address].v = change.newValue;
          workbook.Sheets[sheetName][address].w = change.newValue.toString();
          break;
        case 's':
          if (typeof change.newValue === 'number') {
            workbook.Sheets[sheetName][address].t = 'n';
            workbook.Sheets[sheetName][address].v = change.newValue;
            workbook.Sheets[sheetName][address].w = change.newValue.toString();
            break;
          }
          workbook.Sheets[sheetName][address].v = change.newValue;
          workbook.Sheets[sheetName][address].w = change.newValue;
          break;
        case 'b':
          workbook.Sheets[sheetName][address].v = change.newValue;
          // workbook.Sheets[sheetName][address].w =
          //   typeof change.newValue === 'undefined'
          //     ? undefined
          //     : change.newValue
          //     ? 'TRUE'
          //     : 'FALSE';
          break;
        case 'e':
          switch (typeof change.newValue) {
            case 'number':
              workbook.Sheets[sheetName][address].t = 'n';
              workbook.Sheets[sheetName][address].v = change.newValue;
              workbook.Sheets[sheetName][address].w =
                change.newValue.toString();
              break;
            case 'string':
              workbook.Sheets[sheetName][address].t = 's';
              workbook.Sheets[sheetName][address].v = change.newValue;
              workbook.Sheets[sheetName][address].w = change.newValue;
              break;
            case 'boolean':
              workbook.Sheets[sheetName][address].t = 'b';
              workbook.Sheets[sheetName][address].v = change.newValue;
              // workbook.Sheets[sheetName][address].w =
              //   typeof change.newValue === 'undefined'
              //     ? undefined
              //     : change.newValue
              //     ? 'TRUE'
              //     : 'FALSE';
              break;
          }
          break;
      }
      if (workbook.Sheets[sheetName][address].h) {
        workbook.Sheets[sheetName][address].h = change.newValue;
      }
    }
  }

  xlsx.writeFile(workbook, filePath, { compression: true });

  workbook = xlsx.readFile(filePath, {
    cellFormula: true,
    sheetStubs: true,
  });

  const changedSheetNames = exportedCellChange
    .map((change) => workbook.SheetNames[change.address.sheet])
    .filter((value, index, self) => self.indexOf(value) === index);

  let modifications = {};
  if (changedSheetNames.includes(parametersSheetName)) {
    const range = config.parameters.range.split('!')[1];
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[parametersSheetName],
      {
        raw: true,
        range,
        // makes it an array of array
        header: 1,
        // xlslx returns array with empty slots [1, , , 'Hello']
        // the app expected full arrays with empty strings instead
        defval: '',
      },
    ) as any[][];

    modifications = {
      ...modifications,
      ...(await refreshParameters(project, data)),
    };
  }
  if (config.actions) {
    const [actionsSheetName, range] = config.actions.range.split('!');
    if (changedSheetNames.includes(actionsSheetName)) {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[actionsSheetName], {
        raw: true,
        range,
        // makes it an array of array
        header: 1,
        // xlslx returns array with empty slots [1, , , 'Hello']
        // the app expected full arrays with empty strings instead
        defval: '',
      }) as any[][];

      modifications = {
        ...modifications,
        ...(await refreshActions(project, data)),
      };
    }
  }
  if (config.results) {
    const [resultsSheetName, range] = config.results.range.split('!');
    if (changedSheetNames.includes(resultsSheetName)) {
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[resultsSheetName], {
        raw: true,
        range,
        // makes it an array of array
        header: 1,
        // xlslx returns array with empty slots [1, , , 'Hello']
        // the app expected full arrays with empty strings instead
        defval: '',
      }) as any[][];

      modifications = {
        ...modifications,
        ...(await refreshResults(project, data)),
      };
    }
  }

  //calc
  console.timeEnd('updateParameters');
  const newProject = await Project.findById(project._id);
  if (!newProject) {
    throw new Error('Project not found');
  }
  newProject.set(modifications);
  return await newProject.save();
};

export default updateParameters;
