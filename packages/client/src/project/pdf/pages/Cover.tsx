import { Box, CircularProgress } from '@mui/material';

import { User } from '../../../authentication/context/useUser';
import { Parameter, Project } from '@arviva/core';
import bike from '../images/bike.svg';
import leafs from '../images/leafs-yellow.svg';
import marquee from '../images/marquee.svg';
import person from '../images/person.svg';
import { CoverContentLayout, CoverLayout, Logo, Text } from '../layout';
import { Footer } from './Footer';

export const Cover = ({
  project,
  user,
  parameters,
}: {
  project: Project;
  user: User;
  parameters: Parameter[];
}) => {
  return (
    <CoverLayout>
      <CoverContentLayout>
        <Box height="20px"></Box>
        <Box flex={1} display="flex" alignItems="center">
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            paddingRight={2}
          >
            <Logo src="/logo Arviva.png" />
          </Box>
          <Box borderLeft={1} height="45px"></Box>
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            paddingLeft={2}
          >
            <Text fontSize="35px" fontWeight="bold">
              SEEDS
            </Text>
          </Box>
        </Box>
        <Box height="20px"></Box>
        <Box flex={5} display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            height="9rem"
            justifyContent="center"
            marginBottom={5}
          >
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              paddingRight="30px"
            >
              <img src={marquee} alt="marquee" height="60px" />
            </Box>
            <Box display="flex" alignItems="flex-end" width="60%">
              <Text
                fontSize="50px"
                color="var(--lightgreen);"
                fontWeight="bold"
              >
                {project.name.length > 40
                  ? project.name.substring(0, 40) + '...'
                  : project.name}
              </Text>
            </Box>
            <Box display="flex" alignItems="end" paddingLeft="30px">
              <img src={leafs} alt="leafs" height="60px" />
            </Box>
          </Box>

          <Text fontSize="90px" condensed fontWeight="bold">
            Résultats complets
          </Text>
          <Box height="35px"></Box>
          <Text fontSize="18px" color="var(--lightgreen);" fontWeight="bold">
            Découvrez les impacts détaillés de votre projet ci-dessous
          </Text>

          <Box
            height="1px"
            marginX={5}
            marginY={5}
            sx={{
              background:
                'repeating-linear-gradient(90deg,black 0 10px,white 0 20px)',
            }}
          />
          <Text fontSize="20px">Retrouvez votre plan d'action sur</Text>
          <Box height="30px"></Box>
          <Box display="flex" alignItems="center" justifyContent="space-evenly">
            <Box>
              <img src={person} alt="person" height="60px" />
            </Box>
            <Box
              bgcolor="var(--yellow)"
              paddingX="15px"
              paddingY="5px"
              height="100%"
              borderRadius="15px"
            >
              <Text fontSize="18px" fontWeight="bold">
                seeds.arviva.org
              </Text>
            </Box>
            <Box width="60px"></Box>
          </Box>
          <Box height="30px"></Box>
          <Text fontSize="10px">Votre projet est</Text>
          <Text fontSize="10px">complété à</Text>
          <Box height="20px"></Box>
          <Box display="flex" justifyContent="space-around">
            <Box width="73px"></Box>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                thickness={7}
                value={project.completionRate}
                sx={{ color: 'var(--yellow)' }}
                size={100}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text fontSize="25px" fontWeight="bold">
                  {project.completionRate}%
                </Text>
              </Box>
            </Box>
            <Box>
              <img src={bike} alt="bike" height="60px" />
            </Box>
          </Box>
          <Footer
            project={project}
            user={user}
            parameters={parameters}
            withBorder={false}
          />
        </Box>
      </CoverContentLayout>
    </CoverLayout>
  );
};
