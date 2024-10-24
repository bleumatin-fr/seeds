import { Action, ActionsConfiguration, Impact } from './types';

export const getActions = async (
  rows: any[][],
  config: ActionsConfiguration,
): Promise<Action[]> => {
  const firstEmptyRowIndex = rows.findIndex((row) =>
    row.every((cell) => !cell),
  );

  return rows
    .filter(
      (_, index) =>
        index <
        (firstEmptyRowIndex === -1 ? Number.MAX_VALUE : firstEmptyRowIndex),
    )
    .reduce((actions, row) => {
      let action = actions.find(
        (currentAction) =>
          currentAction.title === row[config.columnIndexes.title],
      );

      const display = Boolean(row[config.columnIndexes.display]);

      if (!action) {
        action = {
          sector: row[config.columnIndexes.sector],
          types: row[config.columnIndexes.types],
          title: row[config.columnIndexes.title],
          link: row[config.columnIndexes.link],
          impacts: [],
          cost: row[config.columnIndexes.cost],
          difficulty: row[config.columnIndexes.difficulty],
          duration: row[config.columnIndexes.duration],
          display,
        };
      }

      // necessary check to avoid pushing action without impact within similar action with impact
      if (display) {
        action.impacts.push({
          scope: row[config.columnIndexes.scope],
          value: row[config.columnIndexes.value],
          unit: row[config.columnIndexes.unit],
          percentage: row[config.columnIndexes.percentage],
          priority: row[config.columnIndexes.priority],
          absoluteValue: row[config.columnIndexes.absoluteValue],
          absolutePercentage: row[config.columnIndexes.absolutePercentage],
        });
      }

      return [
        ...actions.filter(
          (currentAction) => currentAction.title !== action?.title,
        ),
        action,
      ];
    }, [] as Action[])
    .map((action) => ({
      ...action,
      impactValue: action.impacts.reduce(
        (sum: number, impact: Impact) => sum + impact.absolutePercentage,
        0,
      ),
    }))
    .filter((action) => action.display)
    .filter((action) => action.impactValue !== 0 || action.impacts.every((impact: Impact) => impact.value === -1));
};
