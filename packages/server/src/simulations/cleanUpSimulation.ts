import { Project as ProjectType, cleanUpSectors } from '@arviva/core';

const cleanUpSimulation = (project: Partial<ProjectType> | null) => {
  if (!project) {
    return null;
  }
  return {
    ...project,
    sectors: cleanUpSectors(project.sectors || []),
  };
};

export default cleanUpSimulation;