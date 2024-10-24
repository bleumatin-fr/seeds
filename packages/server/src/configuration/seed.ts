import Configuration from './model';

const defaultConfigurations = [
  {
    name: 'impact.day',
    value: `{"0-500":{"rural":100,"périurbain":100,"urbain":100},"500-1000":{"rural":300,"périurbain":300,"urbain":300},"1000+":{"rural":500,"périurbain":500,"urbain":500}}`,
  },
  {
    name: 'impact.spectator',
    value: `{"0-500":{"rural":5,"périurbain":5,"urbain":5},"500-1000":{"rural":4,"périurbain":4,"urbain":4},"1000+":{"rural":11,"périurbain":11,"urbain":11}}`,
  },
  {
    name: 'home.welcomeMessageTitle',
    value:
      'Calculer son <strong>empreinte environnementale</strong> dans le secteur du spectacle vivant',
  },
  {
    name: 'home.welcomeMessage',
    value:
      '<h1 style="text-align: center">SEEDS</h1><p><strong>Le secteur du spectacle vivant</strong> est supporté par une économie carbonée (transports routiers et aériens fréquents, accroissement des usages du numérique, restauration collective, construction et maintenance de bâtiments…) cependant les <strong>émissions de gaz à effet de serre</strong> (GES) du spectacle vivant aussi bien que les <strong>impacts sur la biodiversité et les ressources</strong> sont mal connues.&nbsp;</p><p>Afin de pallier à ce manque de données et d\'outils pour calculer les impacts des projets de spectacle vivant, <strong>Arviva</strong> a développé un outil de Simulation d\'Empreinte Environnementale pour le Spectacle (SEEDS). Cet outil a été pensé pour être <strong>simple d’utilisation</strong> et <strong>adapté aux activités des structures du spectacle vivant</strong> (compagnies, lieux, festivals) et à leurs activités diverses (création, production, diffusion notamment).</p>',
  },
  {
    name: 'home.bottomMessage',
    value:
      "<p><span>Cet outil a été financé par l'ADEME, la Région Île-de-France, l’État (dans le cadre du dispositif « Soutenir les alternatives vertes dans la culture » de la filière des industries culturelles et créatives (ICC) de France 2030, opérée par la Caisse des Dépôts), et l'Union Européenne (dans le cadre du Fonds Social Européen +). Il a été développé par Pascal Besson et Florian Ferbach (Bleu Matin) avec la participation d'Oriana&nbsp;Berthomieu et de Studio T422 sur l'interface. L'algorithme a été développé par l'équipe d'ARVIVA et des membres bénévoles de l'association sur la base d'une étude de Thierry Leonardi pour le score économie circulaire et les indicateurs associés et d'une étude de BL Evolution pour le score biodiversité et les indicateurs associés.</span></p>",
  },
  {
    name: 'home.simulatorMessage',
    value: `<p style="text-align: center"><strong>Testez SEEDS avec </strong></p><h1 style="text-align: center">SEEDy</h1><p style="text-align: center">Le simulateur <strong>SEEDy</strong> est une version simplifiée de <strong>SEEDS</strong> qui vous permet d'avoir un aperçu rapide de l'empreinte environnementale d'un projet de tournée ou de représentation dans le spectacle vivant.</p>`,
  },
  {
    name: 'home.optinMessage',
    value:
      '<p>Je souhaite recevoir des informations relatives à SEEDS, sur ma boîte mail. </p><p>Ces informations peuvent notamment concerner votre activité, les nouveautés et mises à jour de SEEDS et le support utilisateur·ice·s. </p>',
  },
  {
    name: 'version.autoOpenMessage',
    value:
      "Votre projet vient d'être mis à jour ! Consultez les détails de ces mises à jour sur cette page",
  },
  {
    name: 'version.defaultMessage',
    value:
      'Voici les informations sur les dernières mises à jour de votre projet',
  },
  {
    name: 'reports.introduction',
    value:
      '<p>Aucun rapport pour le moment...</p><p>Créez des rapports pour partager vos résultats avec vos collaborateurs et partenaires</p>',
  },
  {
    name: 'buildings.emptyMessage',
    value: `<h1 style="text-align: center">Bienvenue sur l'assistant de gestion des salles de votre projet</h1><p style="text-align: center">Novitates autem si spem adferunt, ut tamquam in herbis non fallacibus fructus appareat, non sunt illae quidem repudiandae, vetustas tamen suo loco conservanda; maxima est enim vis vetustatis et consuetudinis. Quin in ipso equo, cuius modo feci.</p><p style="text-align: center"><strong>Commencez dès maintenant</strong></p>`,
  },
  {
    name: 'buildings.addMessage',
    value: `<p>Les 2 informations ci-dessous sont à demander au responsable de la salle qui vous accueille. <br>Pour gagner du temps, vous pouvez <a target="_blank" rel="noopener noreferrer nofollow" href="arviva.org"><strong>télécharger directement notre courrier type de demande</strong></a></p>`,
  },
  {
    name: 'projects.emptyMessage',
    value: `<h1 style="text-align: center">Bienvenue sur l'assistant de gestion des projets de votre bâtiment / salle</h1><p style="text-align: center">Novitates autem si spem adferunt, ut tamquam in herbis non fallacibus fructus appareat, non sunt illae quidem repudiandae, vetustas tamen suo loco conservanda; maxima est enim vis vetustatis et consuetudinis. Quin in ipso equo, cuius modo feci.</p><p style="text-align: center"><strong>Commencez dès maintenant</strong></p>`,
  },
  {
    name: 'projects.addMessage',
    value: `<p>L'information ci-dessous est à demander au responsable du projet que vous accueillez. <br>Pour gagner du temps, vous pouvez <a target="_blank" rel="noopener noreferrer nofollow" href="arviva.org"><strong>télécharger directement notre courrier type de demande</strong></a></p>`,
  },
];

const seed = async () => {
  await Promise.all(
    defaultConfigurations.map(async (config) => {
      const configuration = await Configuration.findOne({ name: config.name });
      if (!configuration) {
        await new Configuration(config).save();
        return;
      }

      configuration.value = config.value;
      await configuration.save();
    }),
  );

  console.log('Default configuration seeded');
};

export default seed;
