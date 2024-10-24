import { Box } from '@mui/material';
import { format, isValid, parseISO } from 'date-fns';

import { User } from '../../../authentication/context/useUser';
import { Parameter, Project } from '@arviva/core';
import { Text } from '../layout';

export const Footer = ({
  project,
  user,
  parameters,
  withBorder = true,
}: {
  project: Project;
  user: User;
  parameters: Parameter[];
  withBorder?: boolean;
}) => {
  const getParameter = (id: string) => {
    return parameters.find((p) => p.id === id)?.value;
  };
  const previsional = getParameter('Projet_Réalisé');
  const projectName = project.name;
  const structureName = user?.company;
  const startDate = parseISO(getParameter('Projet_Date_Début') as string);
  const endDate = parseISO(getParameter('Projet_Date_Fin') as string);

  return (
    <Box
      marginTop="auto"
      display="flex"
      marginBottom="40px"
      justifyContent="space-evenly"
      columnGap={2}
      paddingX={2}
      height="1.5cm"
      sx={
        withBorder
          ? {
              boxSizing: 'border-box',
              borderRight: '1cm solid var(--brightgreen)',
            }
          : {}
      }
    >
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Text fontSize="12px" fontWeight="bold">
          Nom
          <br /> de la structure
        </Text>
        <Text fontSize="10px">{structureName}</Text>
      </Box>
      <Box borderLeft={1} borderColor="var(--lightgreen)" />
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Text fontSize="12px" fontWeight="bold">
          Nom <br />
          du projet
        </Text>
        <Text fontSize="10px">{projectName}</Text>
      </Box>
      <Box borderLeft={1} borderColor="var(--lightgreen)" />
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Text fontSize="12px" fontWeight="bold">
          Prévisionnel <br />
          ou réalisé
        </Text>
        <Text fontSize="10px">{previsional as string}</Text>
      </Box>
      <Box borderLeft={1} borderColor="var(--lightgreen)" />
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Text fontSize="12px" fontWeight="bold">
          Date de début / <br />
          date de fin
        </Text>
        <Text fontSize="10px">
          {startDate && isValid(startDate) ? format(startDate, 'MM/yy') : null}-
          {endDate && isValid(endDate) ? format(endDate, 'MM/yy') : null}
        </Text>
      </Box>
    </Box>
  );
};
