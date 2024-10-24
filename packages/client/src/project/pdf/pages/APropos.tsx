import { Box } from '@mui/material';

import { User } from '../../../authentication/context/useUser';
import { Parameter, Project } from '@arviva/core';
import lights from '../images/lights.svg';
import question from '../images/question.svg';
import trees from '../images/trees-pink.svg';
import { ContentLayout, PageLayout, Text } from '../layout';
import { Footer } from './Footer';
import { Header } from './Header';

export const APropos = ({
  project,
  user,
  parameters,
}: {
  project: Project;
  user: User;
  parameters: Parameter[];
}) => {
  if (!project) {
    return null;
  }

  return (
    <PageLayout>
      <Header project={project} pageNumber={4} />
      <ContentLayout>
        <Box height="30px" />
        <Box display="flex" columnGap={3}>
          <img src={question} width="80px" alt="" />
          <Text fontSize="70px" fontWeight="bold">
            A propos
          </Text>
        </Box>
        <Box height="30px" />

        <Box
          height="1px"
          width="100%"
          marginBottom={5}
          sx={{
            background:
              'repeating-linear-gradient(90deg,var(--lightgreen) 0 20px,white 0 40px)',
          }}
        />

        <Box
          display="flex"
          columnGap={3}
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          paddingX="5%"
        >
          <Text fontSize="28px" fontWeight="bold" textAlign='left'>
            ARVIVA - Arts vivants, Arts durables
          </Text>
          <Box>
            <img src={lights} width="80px" alt="" />
          </Box>
        </Box>
        <Box height="30px" />
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
          paddingX="5%"
        >
          <Text fontSize="14px" textAlign="justify">
            L'association ARVIVA - Arts vivants, Arts durables est une
            initiative collective née en 2020 du constat que{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              le spectacle vivant a un rôle majeur à jouer pour faire face aux
              enjeux environnementaux.
            </span>{' '}
            Elle rassemble plus de 420 structures, professionnel·le·s, artistes,
            technicien·ne·s, éco-consultant·e·s, réseaux et syndicats du
            spectacle vivant en faveur d'une création artistique durable.
            <br />
            <br />
            Les activités d'ARVIVA s'articulent de manière à envisager à la fois
            la nécessaire{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              décarbonation des activités de spectacle
            </span>
            , la prise en compte des{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              impacts sur la biodiversité
            </span>
            , la réduction de l'
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              utilisation des ressources
            </span>{' '}
            et la{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              valorisation des initiatives inspirantes
            </span>
            .
            <br />
            <br />
            Pour ce faire, les principales logiques d'action de l'association
            sont{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              la concertation et l'échange pair à pair, la conception d'outils
              concrets et structurants, ainsi que l'observation et l'analyse du
              secteur.
            </span>
          </Text>
        </Box>
        <Box height="30px" />
        <Box
          height="1px"
          width="100%"
          marginBottom={5}
          sx={{
            background:
              'repeating-linear-gradient(90deg,var(--lightgreen) 0 20px,white 0 40px)',
          }}
        />
        <Box
          display="flex"
          columnGap={3}
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          paddingX="5%"
        >
          <Text fontSize="28px" fontWeight="bold" textAlign='left'>
            Le projet SEEDS
          </Text>
          <Box>
            <img src={trees} width="80px" alt="" />
          </Box>
        </Box>
        <Box height="30px" />
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
          paddingX="5%"
        >
          <Text fontSize="14px" textAlign="justify">
            Le secteur du spectacle vivant est supporté par une économie
            carbonée (transports routiers et aériens fréquents, accroissement
            des usages du numérique, restauration collective, construction et
            maintenance de bâtiments…) cependant les{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              émissions de gaz à effet de serre
            </span>{' '}
            (GES) du spectacle vivant aussi bien que les{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              impacts sur la biodiversité et les ressources
            </span>{' '}
            sont{' '}
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              mal connues
            </span>
            . Afin de pallier à ce manque de données et d'outils pour calculer
            les impacts des projets de spectacle vivant, Arviva a développé un
            outil de Simulation d'Empreinte Environnementale pour le Spectacle
            (SEEDS).
            <br />
            <br />
            Cet outil a été pensé pour être simple d'utilisation et adapté aux
            activités des structures du spectacle vivant (compagnies, lieux,
            festivals) et à leurs activités diverses (création, production,
            diffusion notamment). Cet outil a été financé par l'ADEME, la Région
            Île-de-France, l'État (dans le cadre du dispositif « Soutenir les
            alternatives vertes dans la culture » de la filière des industries
            culturelles et créatives (ICC) de France 2030, opérée par la Caisse
            des Dépôts), et l'Union Européenne (dans le cadre du Fonds Social
            Européen +).
            <br />
            Il a été développé par Pascal Besson et Florian Ferbach (Bleu Matin)
            avec la participation d'Oriana Berthomieu et Studio T422 sur
            l'interface. L'algorithme a été développé par l'équipe d'ARVIVA et
            des membres bénévoles de l'association sur la base d'une étude de
            Thierry Leonardi pour le score économie circulaire et les
            indicateurs associés et d'une étude de B&L évolution pour le score
            biodiversité et les indicateurs associés.
          </Text>
        </Box>
      </ContentLayout>
      <Footer project={project} user={user} parameters={parameters} />
    </PageLayout>
  );
};
