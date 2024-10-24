import Model from './model';

const seed = async () => {
  // if (process.env.NODE_ENV !== 'development') {
  //   return;
  // }

  const modelsToRegister = [
    {
      name: 'Projets',
      singularName: 'Projet',
      type: 'project',
      description: '',
      spreadsheetId: 'project',
      color: '#FF5B17',
      config: {
        parameters: {
          range: 'Paramètres!A2:Z250',
          columnIndexes: {
            sectors: [0, 1],
            parameters: {
              name: 2,
              unit: 6,
              description: 3,
              type: 4,
              value: 5,
              possibleValues: 8,
              initialValue: 9,
              step: 10,
              min: 11,
              max: 12,
              display: 14,
              displayOnCreate: 13,
              id: 7,
              modelReference: 17,
              information: 15,
            },
          },
          externalModules: {
            tour: ['sector[0]:Mobilité des équipes', 'sector[0]:Fret'],
          },
          defaultTitle: 'Mon projet',
          titleParameterId: ['name'],
          types: {
            'Boutons radio': 'radio',
            'Bouton radio': 'radio',
            'Champ libre': 'text',
            'Case nombre': 'number',
            Liste: 'list',
            Curseur: 'cursor',
            'Cases à cocher': 'checkbox',
            Date: 'date',
          },
          sectors: [
            {
              color: '#B5B5B5',
              icon: 'identity',
            },
            {
              color: '#A55E47',
              icon: 'people',
            },
            {
              color: '#FFA9C4',
              icon: 'energy',
            },
            {
              color: '#FF5B17',
              icon: 'projector',
            },
            {
              color: '#FF9229',
              icon: 'building',
            },
            {
              color: '#FED169',
              icon: 'bike',
            },
            {
              color: '#8746AE',
              icon: 'truck',
            },
            {
              color: '#CEA8FF',
              icon: 'hotel',
            },
            {
              color: '#0B67A9',
              icon: 'food',
            },
            {
              color: '#AFD4FF',
              icon: 'dress',
            },
            {
              color: '#0F9324',
              icon: 'computer',
            },
            {
              color: '#81EFC8',
              icon: 'identity',
            },
          ],
        },
        results: {
          range: 'Résultats!A1:K250',
          mainIndicatorCode: 'co2',
          mainPieCode: 'co2_detailed',
        },
        actions: {
          range: 'Actions!A2:R130',
          columnIndexes: {
            sector: 0,
            subSector: 1,
            // types: 2,
            display: 3,
            title: 4,
            scope: 5,
            value: 6,
            unit: 7,
            percentage: 8,
            cost: 9,
            difficulty: 10,
            duration: 11,
            priority: 11,
            link: 12,
            absoluteValue: 15,
            absolutePercentage: 17,
          },
        },
      },
    },
    {
      name: 'Bâtiments',
      singularName: 'Bâtiment',
      type: 'building',
      description: '',
      spreadsheetId: 'building',
      color: '#FF9229',
      config: {
        parameters: {
          range: 'Paramètres!A2:U150',
          columnIndexes: {
            sectors: [0, 1],
            parameters: {
              name: 2,
              unit: 6,
              description: 3,
              type: 4,
              value: 5,
              possibleValues: 8,
              initialValue: 9,
              step: 10,
              min: 11,
              max: 12,
              display: 14,
              displayOnCreate: 13,
              information: 15,
              id: 7,
            },
          },
          defaultTitle: 'Mon batiment',
          titleParameterId: ['name'],
          types: {
            'Boutons radio': 'radio',
            'Bouton radio': 'radio',
            'Champ libre': 'text',
            'Case nombre': 'number',
            Liste: 'list',
            Curseur: 'cursor',
            'Cases à cocher': 'checkbox',
            Date: 'date',
          },
          sectors: [
            {
              color: '#B5B5B5',
              icon: 'identity',
            },
            {
              color: '#A55E47',
              icon: 'people',
            },
            {
              color: '#FFA9C4',
              icon: 'energy',
            },
            {
              color: '#FF5B17',
              icon: 'projector',
            },
            {
              color: '#FF9229',
              icon: 'building',
            },
            {
              color: '#FED169',
              icon: 'bike',
            },
            {
              color: '#8746AE',
              icon: 'truck',
            },
            {
              color: '#CEA8FF',
              icon: 'hotel',
            },
            {
              color: '#0B67A9',
              icon: 'food',
            },
            {
              color: '#AFD4FF',
              icon: 'dress',
            },
            {
              color: '#0F9324',
              icon: 'computer',
            },
            {
              color: '#81EFC8',
              icon: 'identity',
            },
          ],
        },
        results: {
          range: 'Résultats!A1:K250',
          mainIndicatorCode: 'co2',
          mainPieCode: 'co2_detailed',
        },
        actions: {
          range: 'Actions!A2:S130',
          columnIndexes: {
            sector: 0,
            subSector: 1,
            // types: 2,
            display: 3,
            title: 4,
            scope: 5,
            value: 6,
            unit: 7,
            percentage: 8,
            cost: 9,
            difficulty: 10,
            duration: 11,
            priority: 12,
            link: 13,
            absoluteValue: 16,
            absolutePercentage: 18,
          },
        },
      },
    },

    {
      name: 'Fonctionnements',
      singularName: 'Fonctionnement',
      type: 'operation',
      description: '',
      spreadsheetId: 'operation',
      color: '#FF9229',
      config: {
        parameters: {
          range: 'Paramètres!A2:AA150',
          columnIndexes: {
            sectors: [0, 1],
            parameters: {
              name: 2,
              unit: 6,
              description: 3,
              type: 4,
              value: 5,
              possibleValues: 8,
              initialValue: 9,
              step: 10,
              min: 11,
              max: 12,
              display: 14,
              displayOnCreate: 13,
              information: 15,
              id: 7,
            },
          },
          defaultTitle: 'Mon fonctionnement',
          titleParameterId: ['name'],
          types: {
            'Boutons radio': 'radio',
            'Bouton radio': 'radio',
            'Champ libre': 'text',
            'Case nombre': 'number',
            Liste: 'list',
            Curseur: 'cursor',
            'Cases à cocher': 'checkbox',
            Date: 'date',
          },
          sectors: [
            {
              color: '#B5B5B5',
              icon: 'identity',
            },
            {
              color: '#A55E47',
              icon: 'people',
            },
            {
              color: '#FFA9C4',
              icon: 'energy',
            },
            {
              color: '#FF5B17',
              icon: 'projector',
            },
            {
              color: '#FF9229',
              icon: 'building',
            },
            {
              color: '#FED169',
              icon: 'bike',
            },
            {
              color: '#8746AE',
              icon: 'truck',
            },
            {
              color: '#CEA8FF',
              icon: 'hotel',
            },
            {
              color: '#0B67A9',
              icon: 'food',
            },
            {
              color: '#AFD4FF',
              icon: 'dress',
            },
            {
              color: '#0F9324',
              icon: 'computer',
            },
            {
              color: '#81EFC8',
              icon: 'identity',
            },
          ],
        },
        results: {
          range: 'Résultats!A1:K200',
          mainIndicatorCode: 'co2',
          mainPieCode: 'co2_detailed',
        },
        actions: {
          range: 'Actions!A2:S100',
          columnIndexes: {
            sector: 0,
            subSector: 1,
            // types: 2,
            display: 3,
            title: 4,
            scope: 5,
            value: 6,
            unit: 7,
            percentage: 8,
            cost: 9,
            difficulty: 10,
            duration: 11,
            priority: 12,
            link: 13,
            absoluteValue: 16,
            absolutePercentage: 18,
          },
        },
      },
    },
    {
      name: 'Simulations',
      singularName: 'Simulation',
      type: 'simulation',
      description: '',
      spreadsheetId: 'simulation',
      color: '#FF9229',
      status: 'published',
      versionNumber: 1,
      config: {
        parameters: {
          range: 'Paramètres!A2:Q150',
          columnIndexes: {
            sectors: [0, 1],
            parameters: {
              id: 2,
              name: 3,
              description: 4,
              type: 5,
              value: 6,
              unit: 7,
              possibleValues: 8,
              initialValue: 9,
              step: 10,
              min: 11,
              max: 12,
              displayOnCreate: 13,
              display: 14,
              information: 15,
            },
          },
          defaultTitle: 'Ma simulation',
          titleParameterId: [],
          sectors: [
            {},
            {
              color: '#B5B5B5',
              icon: 'identity',
            },
            {
              color: '#A55E47',
              icon: 'people',
            },
            {
              color: '#FFA9C4',
              icon: 'energy',
            },
            {
              color: '#FF5B17',
              icon: 'projector',
            },
            {
              color: '#FF9229',
              icon: 'building',
            },
            {
              color: '#FED169',
              icon: 'bike',
            },
            {
              color: '#8746AE',
              icon: 'truck',
            },
            {
              color: '#CEA8FF',
              icon: 'hotel',
            },
            {
              color: '#0B67A9',
              icon: 'food',
            },
            {
              color: '#AFD4FF',
              icon: 'dress',
            },
            {
              color: '#0F9324',
              icon: 'computer',
            },
            {
              color: '#81EFC8',
              icon: 'identity',
            },
          ],
        },
        results: {
          range: 'Résultats!A1:K100',
        },
      },
    },
  ];

  // await Model.create(modelsToRegister[modelsToRegister.length - 1]);

  await Promise.all(
    modelsToRegister.map((model) => {
      // return Model.create({ ...model, status: 'draft', versionNumber: 2 });
      // return Model.findOneAndUpdate(
      //   { type: model.type, status: 'published' },
      //   model,
      //   {
      //     upsert: true,
      //     new: true,
      //   },
      // );
    }),
  );

  console.log('Project Models seeded');
};

export default seed;
