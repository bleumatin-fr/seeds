import { Project } from '@arviva/core';

export const blocks = {
  structure: {
    id: 'structure',
    name: 'Structure',
    color: 'var(--yellow)',
    width: '100%',
    models: ['building', 'operation'],
  },
  show: {
    id: 'show',
    name: 'Projets',
    color: 'var(--lightgreen)',
    width: '100%',
    models: ['project'],
  },
  building: {
    id: 'building',
    name: 'Bâtiments / Sites',
    color: 'var(--yellow)',
    width: '50%',
    models: ['building'],
  },
  operation: {
    id: 'operation',
    name: 'Fonctionnements',
    color: 'var(--yellow)',
    width: '50%',
    models: ['operation'],
  },
};

export const dashboardText = {
  createButton: {
    //model as key
    building: 'bâtiment / site',
    operation: 'fonctionnement',
    project: 'projet',
  },
  emptyBlock: {
    title: {
      //model as key
      building: 'Créez votre premier bâtiment / site',
      operation: 'Créez votre premier "fonctionnement"',
      project: 'Créez votre premier projet',
    },
    description: {
      //model as key
      building:
        'Empreinte environnementale des différents bâtiments / sites occupés par votre structure.',
      operation:
        'Empreinte environnementale du fonctionnement de vos équipes, soit l\'activité "au bureau"',
      project:
        "Empreinte environnementale des projets de votre structure. Vous pouvez décider d'évaluer un projet dans son ensemble, de sa création à sa fin de vie, ou simplement une partie. Un projet peut être une production, une tournée, un album, un festival, une représentation...",
    },
  },
};

export const dashboardConfig1 = [
  {
    height: '34%',
    blocks: [blocks.structure],
  },
  {
    height: '66%',
    blocks: [blocks.show],
  },
];

export const dashboardConfig2 = [
  {
    height: '34%',
    blocks: [blocks.building, blocks.operation],
  },
  {
    height: '66%',
    blocks: [blocks.show],
  },
];

export const sortByDate = (a: Project, b: Project) => {
  return (
    (new Date(b.updatedAt) || new Date(b.createdAt)).getTime() -
    (new Date(a.updatedAt) || new Date(a.createdAt)).getTime()
  );
};
