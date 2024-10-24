import { Box } from '@mui/material';
import { Project } from '@arviva/core';
import { Text } from '../layout';

export const Header = ({
  project,
  pageNumber,
}: {
  project: Project;
  pageNumber: number;
}) => {
  const projectName = project.name;
  return (
    <Box
      display="flex"
      alignItems="center"
      boxSizing="border-box"
      borderRight="1cm solid var(--brightgreen)"
      height="20mm"
      paddingRight={2}
      borderBottom="solid 2px var(--lightgreen)"
    >
      <Text fontSize="25px" fontWeight="bold">
        SEEDS
      </Text>
      <Box
        borderLeft={1}
        height="45px"
        borderColor="var(--lightgreen)"
        marginLeft={2}
        marginRight={2}
      ></Box>
      <Text fontSize="25px" fontWeight="bold">
        {projectName}
      </Text>
      <Box
        borderLeft={1}
        height="45px"
        borderColor="var(--lightgreen)"
        marginLeft={2}
        marginRight={2}
      ></Box>
      <Box display="flex" width="100%" justifyContent="flex-end" columnGap={2}>
        <Text fontSize="20px" color="var(--lightgreen)" fontWeight="bold">
          RÉSULTATS
          <br />
          COMPLETS
        </Text>
        <Box borderLeft={1} height="45px" borderColor="var(--lightgreen)"></Box>
        <Text fontSize="40px" fontWeight="bold">
          {pageNumber.toString().padStart(2, '0')}
        </Text>
      </Box>
    </Box>
  );
};
