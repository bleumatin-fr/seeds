import { Parameter, Project, Sector, Value } from '@arviva/core';

export const getValue = <T>(value: Value): T | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return value as unknown as T;
};

const flattenParameters = (sectors: Sector[]): Parameter[] =>
  sectors.reduce((allParameters, sector) => {
    const subParameters = flattenParameters(sector.sectors || []);

    return [...allParameters, ...sector.parameters, ...subParameters];
  }, [] as Parameter[]);

const getProjectTitle = (
  project: Partial<Project>,
  defaultTitle: string,
): string | undefined => {
  let title: string | undefined = undefined;

  const titleParameters = flattenParameters(project.sectors || [])
    .filter(
      (parameter) =>
        parameter.id &&
        project.model?.config.parameters.titleParameterId?.includes(
          parameter.id,
        ),
    )
    .sort((a, b) => {
      const aIndex =
        project.model?.config.parameters.titleParameterId?.indexOf(
          a.id as string,
        ) || -1;
      const bIndex =
        project.model?.config.parameters.titleParameterId?.indexOf(
          b.id as string,
        ) || -1;

      return aIndex - bIndex;
    });

  if (titleParameters && titleParameters.length) {
    title =
      titleParameters.reduce((title, titleParameter) => {
        const value = getValue<string>(titleParameter.value);

        if (value) {
          return `${title} ${value}`;
        }

        return title;
      }, '') || defaultTitle;
  }

  if (!title) {
    title = project.model?.config.parameters.defaultTitle;
  }

  if (!title) {
    title = "Mon projet";
  }

  return title?.trim();
};

export default getProjectTitle;
