import { Parameter, Sector } from "@arviva/core";

const flattenParameters = (sectors: Sector[]): Parameter[] =>
    sectors.reduce((allParameters, sector) => {
      const subParameters = flattenParameters(sector.sectors);
  
      return [...allParameters, ...sector.parameters, ...subParameters];
    }, [] as Parameter[]);

export default flattenParameters