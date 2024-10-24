import styled from '@emotion/styled';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { Fade, Link } from '@mui/material';

import { Travel, TravelLoad } from '../context/types';

const TravelsSummaryContainer = styled.div`
  display: flex;
  left: 20%;
  position: relative;
`;

const TravelsSummary = ({
  travels,
  onDetailsClick,
}: {
  travels: Travel[];
  onDetailsClick: () => void;
}) => {
  const { freightValue, passengerValue } = travels.reduce(
    ({ freightValue, passengerValue }, travel) => {
      if (!travel.value) {
        return { freightValue, passengerValue };
      }
      if (travel.load === TravelLoad.PASSENGER) {
        return { freightValue, passengerValue: passengerValue + travel.value };
      }
      if (travel.load === TravelLoad.FREIGHT) {
        return { passengerValue, freightValue: freightValue + travel.value };
      }
      return { freightValue, passengerValue };
    },
    { freightValue: 0, passengerValue: 0 },
  );

  return (
    <Fade in unmountOnExit>
      <TravelsSummaryContainer>
        <ZoomInIcon />
        <Link component="button">
          {travels.length || 'Aucun'} trajet{travels.length > 2 ? 's' : ''}
          {!!passengerValue && `, ${passengerValue} personnes`}
          {!!freightValue && `, ${freightValue}  kg de marchandises`}
        </Link>
      </TravelsSummaryContainer>
    </Fade>
  );
};

export default TravelsSummary;
