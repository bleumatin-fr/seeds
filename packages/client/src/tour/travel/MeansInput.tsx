import {
  FormControl,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ChangeEvent, MouseEvent } from 'react';

import DirectionsBoatOutlinedIcon from '@mui/icons-material/DirectionsBoatOutlined';
import BusIcon from '@mui/icons-material/DirectionsBusFilledOutlined';
import CarIcon from '@mui/icons-material/DirectionsCarOutlined';
import TrainIcon from '@mui/icons-material/DirectionsTransitFilledOutlined';
import ElectricCarOutlinedIcon from '@mui/icons-material/ElectricCarOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import BikeIcon from '../../ui/icons/bike.svg?react';
import BulletTrainIcon from '../../ui/icons/bullet-train.svg?react';
import CarShareIcon from '../../ui/icons/carsharing.svg?react';
import PlaneIcon from '../../ui/icons/plane.svg?react';
import SmallTruckIcon from '../../ui/icons/small_truck.svg?react';
import TruckIcon from '../../ui/icons/truck.svg?react';
import VanIcon from '../../ui/icons/van.svg?react';

import styled from '@emotion/styled';
import { TravelMean, TravelMeanRepartition } from '../context/types';

const meanToIcon = (mean: TravelMean) => {
  switch (mean) {
    case TravelMean.BIKE:
      return <BikeIcon />;
    case TravelMean.CARSHARE:
      return <CarShareIcon />;
    case TravelMean.CAR:
      return <CarIcon />;
    case TravelMean.ECAR:
      return <ElectricCarOutlinedIcon />;
    case TravelMean.BUS:
      return <BusIcon />;
    case TravelMean.PLANE:
      return <PlaneIcon />;
    case TravelMean.REGIONAL_TRAIN:
      return <TrainIcon />;
    case TravelMean.TRAIN:
      return <BulletTrainIcon />;
    case TravelMean.BOAT:
      return <DirectionsBoatOutlinedIcon />;
    case TravelMean.VAN:
      return <VanIcon />;
    case TravelMean.SMALL_TRUCK:
      return <SmallTruckIcon />;
    case TravelMean.TRUCK:
      return <TruckIcon />;
    default:
      return <WarningIcon />;
  }
};
const meanToTooltip = (mean: TravelMean) => {
  switch (mean) {
    case TravelMean.BIKE:
      return 'Vélo';
    case TravelMean.CARSHARE:
      return 'Covoiturage';
    case TravelMean.CAR:
      return 'Voiture/van/taxi thermique';
    case TravelMean.ECAR:
      return 'Voiture/van/taxi électrique ';
    case TravelMean.BUS:
      return 'Tourbus';
    case TravelMean.PLANE:
      return 'Avion';
    case TravelMean.REGIONAL_TRAIN:
      return 'Train régional';
    case TravelMean.TRAIN:
      return 'Train';
    case TravelMean.BOAT:
      return 'Ferry';
    case TravelMean.VAN:
      return 'Camionette';
    case TravelMean.SMALL_TRUCK:
      return 'Camion rigide';
    case TravelMean.TRUCK:
      return 'Semi-remorque';
    default:
      return '';
  }
};

const RepartitionSpacer = styled.div`
  display: inline;
  width: 39px;
`;

const RepartitionContainer = styled.div`
  display: flex;
`;

const MeansInput = ({
  value,
  means,
  onChange,
}: {
  value?: TravelMeanRepartition[] | null;
  means: TravelMean[];
  onChange: (means: TravelMeanRepartition[]) => void;
}) => {
  const meansValue = value?.map(({ type }) => type);

  const handleOnMeanChange = (
    event: MouseEvent<HTMLElement>,
    selectedValue: any,
  ) => {
    const selectedMeans = selectedValue as TravelMean[];
    const percentageTouched = value?.some(
      ({ percentage }) => percentage !== Math.round(100 / (value?.length || 1)),
    );
    const percentageRemaining = value?.reduce((total, { percentage }) => {
      return total - percentage;
    }, 100);

    const changedMeans: TravelMeanRepartition[] = selectedMeans.map(
      (selectedMean) => {
        const originalPercentage = value?.find(
          ({ type }) => type === selectedMean,
        )?.percentage;

        if (percentageTouched) {
          return {
            type: selectedMean,
            percentage: originalPercentage || percentageRemaining || 0,
          };
        }

        return {
          type: selectedMean,
          percentage: Math.round(100 / selectedMeans.length),
        };
      },
    );
    onChange(changedMeans);
  };

  const handleOnPercentageChange =
    (mean: TravelMean) => (event: ChangeEvent<HTMLInputElement>) => {
      const foundTravelMeanRepartition = value?.find(
        (meanRepartition) => meanRepartition.type === mean,
      );
      if (foundTravelMeanRepartition) {
        onChange([
          ...(value || []).filter(
            (meanRepartition) => meanRepartition.type !== mean,
          ),
          {
            ...foundTravelMeanRepartition,
            percentage: parseFloat(event.target.value),
          },
        ]);
      }
    };

  return (
    <div
      style={{ fill: 'currentColor' }}
      data-tour="tour-transport-select-means"
    >
      <ToggleButtonGroup
        size="small"
        value={meansValue}
        onChange={handleOnMeanChange}
      >
        {means.map((mean) => (
          <ToggleButton
            key={mean}
            value={mean}
            aria-label={mean}
            title={meanToTooltip(mean)}
            style={{ width: '39px', paddingLeft: 0, paddingRight: 0}}
          >
            {meanToIcon(mean)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <RepartitionContainer>
        {(value || []).length > 1 &&
          means.map((mean) => {
            if (!value?.find(({ type }) => type === mean)) {
              return <RepartitionSpacer key={mean} />;
            }
            return (
              <FormControl sx={{ width: 39 }} key={mean}>
                <OutlinedInput
                  id="means-test"
                  endAdornment="%"
                  onChange={handleOnPercentageChange(mean)}
                  value={value?.find(({ type }) => type === mean)?.percentage}
                  sx={{
                    padding: '2px',
                    fontSize: 12,
                    alignItems: 'baseline',
                    '& input': {
                      padding: 0,
                      textAlign: 'right',
                      marginRight: '1px',
                    },
                  }}
                />
              </FormControl>
            );
          })}
      </RepartitionContainer>
    </div>
  );
};

export default MeansInput;
