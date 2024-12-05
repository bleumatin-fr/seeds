import fs from 'fs/promises';
import path from 'path';
import xlsx from 'xlsx';

export type SpreadsheetType = 'local';
/**
 * Genereates a new unique spreadsheet id
 * @returns The new id
 */
export const getNewId = (): string =>
  new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

/**
 * Gets the file path of a spreadsheet
 * @param spreadsheetId The id of the spreadsheet
 * @returns The file path of the spreadsheet
 */
export const getFilePath = (spreadsheetId: string): string => {
  if (!process.env.DOCBUILDER_SPREADSHEET_FOLDER) {
    throw new Error('DOCBUILDER_SPREADSHEET_FOLDER not set');
  }

  return path.resolve(
    process.env.DOCBUILDER_SPREADSHEET_FOLDER,
    `${spreadsheetId}.xlsx`,
  );
};

/**
 * Create a new empty spreadsheet
 * @returns The new spreadsheet id
 */
export const create = async (): Promise<string> => {
  return await copy('template');
};

/**
 * Add empty sheets to a workbook
 * @param spreadsheetId The spreadsheet to add the new sheets to
 * @param sheetTitles Names of the new sheets
 */
export const createSheets = async (
  spreadsheetId: string,
  sheetTitles: string[],
) => {
  const filePath = getFilePath(spreadsheetId);
  const workbook = xlsx.readFile(filePath);

  sheetTitles.forEach((sheetTitle) => {
    const worksheet = xlsx.utils.aoa_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetTitle);
  });

  xlsx.writeFile(workbook, filePath);

  return sheetTitles;
};

/**
 * Remove sheets from a spreadsheet by name
 * @param spreadsheetId The spreadsheet to remove a sheet from
 * @param sheetTitles The sheet names to remove
 */
export const removeSheetByName = async (
  spreadsheetId: string,
  sheetTitles: string[],
) => {
  const filePath = getFilePath(spreadsheetId);
  const workbook = xlsx.readFile(filePath);

  sheetTitles.forEach((sheetTitle) => {
    delete workbook.Sheets[sheetTitle];
  });

  xlsx.writeFile(workbook, filePath);
};

/**
 * Remove sheets from a spreadsheet by index
 * @param spreadsheetId The spreadsheet to remove a sheet from
 * @param sheetIndexes The sheet indexes to remove
 */
export const removeSheetsByIndex = async (
  spreadsheetId: string,
  sheetIndexes: number[],
) => {
  const filePath = getFilePath(spreadsheetId);
  const workbook = xlsx.readFile(filePath);

  const sheetTitles = workbook.SheetNames.filter((_: any, index: number) => {
    return sheetIndexes.includes(index);
  });

  sheetTitles.forEach((sheetTitle: string) => {
    delete workbook.Sheets[sheetTitle];
    workbook.SheetNames = workbook.SheetNames.filter(
      (name: string) => name !== sheetTitle,
    );
  });

  xlsx.writeFile(workbook, filePath);
};

/**
 *
 * @param spreadsheetId The spreadsheet to read from
 * @param range The range to read from. ex: Sheet!A1:B2
 * @returns The values that were read. ex: [['A1 value', 'A2 value'], ['B1 value', 'B2 value']]
 */
export const read = async (
  spreadsheetId: string | ArrayBufferLike,
  ranges: { [key: string]: string },
  raw: boolean = true,
): Promise<{ [key: string]: any[][] }> => {
  let workbook: xlsx.WorkBook | null = null;
  switch (typeof spreadsheetId) {
    case 'string':
      workbook = xlsx.readFile(getFilePath(spreadsheetId), {
        sheetStubs: true,
      });
      break;
    case 'object':
      workbook = xlsx.read(spreadsheetId, { sheetStubs: true });
      break;
  }

  const results: { [key: string]: any[][] } = {};
  Object.keys(ranges)
    .filter((rangeName) => !!ranges[rangeName])
    .forEach((rangeName) => {
      const range = ranges[rangeName];
      if (!workbook) {
        throw new Error('Invalid spreadsheetId');
      }

      if (!range.includes('!')) {
        throw new Error(
          'Missing sheet in given range ${range}, syntax: Sheet!A1:A3',
        );
      }
      const [sheet, cells] = range.split('!');

      results[rangeName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], {
        raw,
        range: cells,
        // makes it an array of array
        header: 1,
        // xlslx returns array with empty slots [1, , , 'Hello']
        // the app expected full arrays with empty strings instead
        defval: '',
      });
    });

  return results;
};

/**
 * Write data on a spreadsheet
 * @param spreadsheetId The spreadsheet to write to
 * @param range The range to write to. ex: Sheet!A1:B2
 * @param values The values to write. ex: [['A1 value', 'A2 value'], ['B1 value', 'B2 value']]
 */
export const write = async (
  spreadsheetId: string,
  range: string,
  values: any[][],
) => {
  if (!range.includes('!')) {
    throw new Error('Missing sheet in given range, syntax: Sheet!A1:A3');
  }
  const [sheet, cells] = range.split('!');

  const { s: start, e: end } = xlsx.utils.decode_range(cells);
  const expectedColumnLength = 1 + end.c - start.c;
  const expectedRowLength = 1 + end.r - start.r;

  if (values.length !== expectedRowLength) {
    throw new Error(
      `Given values have ${values.length} rows but range has ${expectedRowLength}`,
    );
  }
  const brokenRow = values.find((row) => row.length !== expectedColumnLength);
  if (brokenRow) {
    throw new Error(
      `The row of index ${values.indexOf(brokenRow)} has ${
        brokenRow.length
      } columns but range has ${expectedColumnLength}`,
    );
  }

  const filePath = getFilePath(spreadsheetId);
  const workbook = xlsx.readFile(filePath, { cellFormula: true });

  const startingCell = cells.includes(':') ? cells.split(':')[0] : cells;

  const preparedValues = values.map((row) => {
    return row.map((value) => {
      if (value === null) {
        return '';
      }
      if (Array.isArray(value)) {
        return value.join(',');
      }
      return value;
    });
  });

  try {
    xlsx.utils.sheet_add_aoa(workbook.Sheets[sheet], preparedValues, {
      origin: startingCell,
    });
    xlsx.writeFile(workbook, filePath, { compression: true });
  } catch (e) {
    console.log(e);
  }
};

/**
 * Copies an existing spreadsheet to a new one
 * @param spreadsheetId The spreadsheet id to copy
 * @returns The copied spreadsheet id
 */
export const copy = async (spreadsheetId: string): Promise<string> => {
  const filePath = getFilePath(spreadsheetId);

  const newSpreadsheetId = getNewId();
  const newFilePath = getFilePath(newSpreadsheetId);

  await fs.copyFile(filePath, newFilePath);

  return newSpreadsheetId;
};

/**
 * Deletes a spreadsheet
 * @param spreadsheetId The spreadsheet id to delete
 */
export const remove = async (spreadsheetId: string): Promise<void> => {
  return fs.rm(getFilePath(spreadsheetId), { recursive: true, force: true });
};

export default {
  create,
  read,
  write,
  copy,
  remove,
  createSheets,
  removeSheetByName,
  removeSheetsByIndex,
  getFilePath,
  getNewId,
};