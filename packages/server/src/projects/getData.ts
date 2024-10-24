import { Project, Result } from '@arviva/core';

const getData = (project: Project) => {
  const { mainIndicatorCode, mainPieCode } = project.model.config.results;
  const mainIndicator = project.results?.find(
    (result: Result) => 'code' in result && result.code === mainIndicatorCode,
  );

  const mainPie = project.results?.find(
    (result: Result) => 'code' in result && result.code === mainPieCode,
  );
  return {
    mainIndicator,
    mainPie,
  };
};

export default getData;
