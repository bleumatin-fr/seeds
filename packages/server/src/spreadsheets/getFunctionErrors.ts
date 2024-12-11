import {
  DetailedCellError as HfDetailedCellError,
  HyperFormula,
  SerializedNamedExpression,
} from 'hyperformula';
import xlsx from 'xlsx';
import { getSheetsArrayFromWorkbook } from '../projects/updateParameters';

interface DetailedCellError {
  value: string | undefined;
  address: string;
  type: string;
  message: string;
}

export const collectErrors = (hf: HyperFormula): DetailedCellError[] => {
  const workbookData = hf.getAllSheetsValues();
  const errors: DetailedCellError[] = [];
  Object.keys(workbookData).forEach((sheetName) => {
    const sheetData = workbookData[sheetName];
    sheetData.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell instanceof HfDetailedCellError) {
          const cellAddress = xlsx.utils.encode_cell({
            c: cellIndex,
            r: rowIndex,
          });
          errors.push({
            value: cell.value,
            address: `${sheetName}!${cellAddress}`,
            type: cell.type,
            message: cell.message,
          });
        }
      });
    });
  });
  return errors;
};

const isNamedExpressionValid = (expressionName: string): boolean => {
  if (/^[A-Za-z]+[0-9]+$/.test(expressionName)) {
    return false;
  }
  return /^[A-Za-z\u00C0-\u02AF_][A-Za-z0-9\u00C0-\u02AF._]*$/.test(
    expressionName,
  );
};

const getFunctionErrors = async (buffer: ArrayBufferLike) => {
  const workbook = xlsx.read(buffer, {
    cellFormula: true,
    sheetStubs: true,
  });

  const namedExpressions: SerializedNamedExpression[] =
    workbook.Workbook?.Names?.filter((name) => !name.Sheet)
      .filter(({ Name }) => !Name.startsWith('_'))
      .filter(({ Sheet }) => typeof Sheet === 'undefined')
      .filter(
        ({ Name }, index, allNames) =>
          allNames.findIndex(({ Name: name }) => name === Name) === index,
      )
      .map(({ Name, Ref, Sheet }) => {
        return {
          name: Name,
          expression: Ref,
          scope: Sheet,
        };
      }) || [];

  const namedExpressionsErrors: DetailedCellError[] = namedExpressions
    .filter(({ name }) => !isNamedExpressionValid(name))
    .map(({ name }) => ({
      value: undefined,
      address: name,
      type: 'ERROR',
      message: `Name of Named Expression '${name}' is invalid`,
    }));

  const sheetsArray = getSheetsArrayFromWorkbook(workbook);

  const hf = HyperFormula.buildFromSheets(
    sheetsArray,
    {
      licenseKey: 'gpl-v3',
      useArrayArithmetic: true,
      smartRounding: true,
      useColumnIndex: true,
    },
    namedExpressions.filter(({ name }) => isNamedExpressionValid(name)),
  );
  return [...namedExpressionsErrors, ...collectErrors(hf)];
};

export default getFunctionErrors;
