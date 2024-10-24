import { Project as ProjectType, cleanUpSectors } from '@arviva/core';

const cleanUpProject = (project: ProjectType | null) => {
  if (!project) {
    return null;
  }
  return {
    ...project,
    sectors: cleanUpSectors(project.sectors || []),
  };
};

export default cleanUpProject;