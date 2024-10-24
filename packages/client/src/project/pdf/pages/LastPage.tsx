import { Box } from '@mui/material';

import bike from '../images/bike.svg';
import leafs from '../images/leafs-yellow.svg';
import logo from '../images/Logo-arviva-blanc.svg';
import trees from '../images/trees-pink.svg';
import { LastPageLayout, Logo, Text } from '../layout';

export const LastPage = () => (
  <LastPageLayout>
    <Box width="100%" height="100%" bgcolor="var(--lightgreen)">
      <Box height="25%" />
      <Box display="flex" justifyContent="space-between" paddingX="8%">
        <img src={trees} width="100px" alt="Trees" />
        <img src={leafs} width="200px" alt="Leafs" />
      </Box>
      <Box height="10%" />
      <Box width="100%" paddingX="8%">
        <Text textAlign="justify" color="white" fontSize="40px">
          Pour la moindre question ou suggestion concernant <b>SEEDS,</b>
          &nbsp; n'hésitez pas : contactez-nous!
        </Text>
      </Box>
      <Box height="5%" />
      <Box
        width="100%"
        paddingX="8%"
        display="flex"
        justifyContent="space-between"
      >
        <Text textAlign="justify" color="white" fontSize="40px">
          <b>seeds@arviva.org</b>
        </Text>
        <img src={bike} width="80px" alt="Bike" />
      </Box>
      <Box height="10%" />

      <Box flex={1} display="flex" alignItems="center">
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          paddingRight={2}
        >
          <Logo src={logo} />
        </Box>
        <Box borderLeft={1} borderColor="white" height="45px"></Box>
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          paddingLeft={2}
        >
          <Text fontSize="35px" fontWeight="bold" color="white">
            SEEDS
          </Text>
        </Box>
      </Box>
    </Box>
  </LastPageLayout>
);
