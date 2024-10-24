import { Box, LinearProgress } from '@mui/material';

import { BarStacked1D, Parameter, Project, ScoreCard } from '@arviva/core';
import { User } from '../../../authentication/context/useUser';
import fabric from '../images/fabric.svg';
import recycle from '../images/recycle.svg';
import { ContentLayout, PageLayout, Text } from '../layout';
import { PdfAbacus } from '../PdfAbacus';
import PdfBarStacked1DComponent from '../PdfBarStacked1DComponent';
import { Footer } from './Footer';
import { Header } from './Header';

export const ResourcesResults = ({
  project,
  user,
  parameters,
}: {
  project: Project;
  user: User;
  parameters: Parameter[];
}) => {
  if (!project || !user) {
    return null;
  }
  const resourcesResult = project.results.find(
    (result) => (result as ScoreCard).code === 'ressources',
  ) as ScoreCard;
  const ressourcesScoreString = resourcesResult?.score;
  const ressourcesScore = ressourcesScoreString
    ? parseInt(ressourcesScoreString.split('/')[0])
    : 0;
  const ressourcesDetails = project.results.find(
    (result) => (result as BarStacked1D).code === 'ressources_detailed',
  ) as BarStacked1D;

  return (
    <PageLayout>
      <Header project={project} pageNumber={3} />
      <ContentLayout>
        <Box height="30px" />
        <Box display="flex" columnGap={3}>
          <img src={recycle} width="80px" alt="Co2 cloud" />
          <Text fontSize="70px" fontWeight="bold">
            Ressources
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
          justifyContent="space-evenly"
          alignItems="center"
          columnGap={5}
          width="100%"
          paddingX="5%"
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Text fontSize="25px" fontWeight="bold">
              Score ressources
            </Text>
            <Box display="flex" paddingLeft="10px" alignItems="center">
              <Text fontSize="90px" color="var(--lightgreen)" fontWeight="bold">
                {ressourcesScore}
              </Text>
              <Box>
                <Text fontSize="30px" fontWeight="bold">
                  /100
                </Text>
                <Box height="10px" />
                <LinearProgress
                  variant="determinate"
                  sx={{ color: 'var(--yellow)' }}
                  value={ressourcesScore}
                />
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            rowGap="30px"
            alignItems="center"
            width="100%"
          >
            <img src={fabric} width="80px" alt="Co2 cloud" />
            <PdfAbacus result={resourcesResult} visible={true} />
          </Box>
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
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
        >
          <Text fontSize="12px">
            <b>SEEDS&nbsp;</b>
            ne mesure pas uniquement vos émissions de gaz à effet de serre !
            L'outil évalue également la gestion des ressources liées à votre
            activités&nbsp;
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              l'impact de vos ressources&nbsp;
            </span>
            et voici le détail de votre score concernant votre projet.
          </Text>
        </Box>
        <Box height="30px" />
        <Box width="100%" height="30%">
          <PdfBarStacked1DComponent result={ressourcesDetails} />
        </Box>
        <Box height="30px" />
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          justifyContent="center"
          paddingX="5%"
        >
          <Text fontSize="12px" textAlign="justify">
            Ce graphique présente votre score Ressources.&nbsp;
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              Plus votre score se rapproche du maximum et plus vous mettez en
              place une bonne gestion des ressources liées à votre projet
              (économie circulaire, gestion des déchets...).&nbsp;
            </span>
            La partie claire, au dessus du graphique, représente votre marge
            d'amélioration. Pour améliorer votre score, allez découvrir l'onglet
            "Passez à l'action".
          </Text>
        </Box>
      </ContentLayout>
      <Footer project={project} user={user} parameters={parameters} />
    </PageLayout>
  );
};
