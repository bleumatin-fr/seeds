import { Box, LinearProgress } from '@mui/material';

import { BarStacked1D, Parameter, Project, ScoreCard } from '@arviva/core';
import { User } from '../../../authentication/context/useUser';
import bee from '../images/bee.svg';
import leafsYellow from '../images/leafs-yellow.svg';
import { ContentLayout, PageLayout, Text } from '../layout';
import { PdfAbacus } from '../PdfAbacus';
import PdfBarStacked1DComponent from '../PdfBarStacked1DComponent';
import { Footer } from './Footer';
import { Header } from './Header';

export const BiodiversityResults = ({
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
  const biodiversityResult = project.results.find(
    (result) => (result as ScoreCard).code === 'biodiv',
  ) as ScoreCard;
  const biodiversityScoreString = biodiversityResult?.score;
  const biodiversityScore = biodiversityScoreString
    ? parseInt(biodiversityScoreString.split('/')[0])
    : 0;
  const biodiversityDetails = project.results.find(
    (result) => (result as BarStacked1D).code === 'biodiversity_detailed',
  ) as BarStacked1D;

  return (
    <PageLayout>
      <Header project={project} pageNumber={2} />
      <ContentLayout>
        <Box height="30px" />
        <Box display="flex" columnGap={3}>
          <img src={bee} width="80px" alt="Co2 cloud" />
          <Text fontSize="70px" fontWeight="bold">
            Biodiversité
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
              Score biodiversité
            </Text>
            <Box display="flex" paddingLeft="10px" alignItems="center">
              <Text fontSize="90px" color="var(--lightgreen)" fontWeight="bold">
                {biodiversityScore}
              </Text>
              <Box>
                <Text fontSize="30px" fontWeight="bold">
                  /100
                </Text>
                <Box height="10px" />
                <LinearProgress
                  variant="determinate"
                  sx={{ color: 'var(--yellow)' }}
                  value={biodiversityScore}
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
            <img src={leafsYellow} width="80px" alt="Co2 cloud" />
            <PdfAbacus result={biodiversityResult} visible={true} />
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
          paddingX="5%"
        >
          <Text fontSize="12px" textAlign="justify">
            <b>SEEDS</b> ne mesure pas uniquement vos émissions de gaz à effet
            de serre ! L'outil évalue également&nbsp;
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              l'impact de vos activités sur la biodiversité&nbsp;
            </span>
            et voici le détail de votre score concernant votre projet.
          </Text>
        </Box>
        <Box height="30px" />
        <Box width="100%" height="30%">
          <PdfBarStacked1DComponent result={biodiversityDetails} />
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
            Ce graphique présente votre score Biodiversité. Votre score
            Biodiversité global est la somme des scores par catégories, dont
            vous pouvez voir le détail ci-dessus.&nbsp;
            <br />
            <span style={{ fontWeight: 'bold', color: 'var(--lightgreen)' }}>
              Plus votre score se rapproche du maximum et plus votre démarche
              est respectueuse de la biodiversité.&nbsp;
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
