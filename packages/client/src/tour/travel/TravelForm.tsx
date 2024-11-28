import styled from '@emotion/styled';
import { ChangeEvent } from 'react';

import {
  Travel,
  TravelLocation,
  TravelMean,
  TravelMeanRepartition,
  TravelType,
} from '../context/types';
import useStep from '../context/useStep';
import useTour from '../context/useTour';

import { IconButton, InputAdornment } from '@mui/material';
import ButtonWithConfirm from '../../ui/ButtonWithConfirm';
import Delete from '../../ui/icons/delete.svg?react';
import CityAutocomplete from '../CityAutocomplete';
import computeDistance from './computeDistance';
import MeansInput from './MeansInput';
import ValueInput from './ValueInput';

const travelTypeConfig: {
  [id: string]: {
    valueLabel: string;
    unit: string;
    means: TravelMean[];
  };
} = {
  PASSENGER: {
    unit: 'personnes',
    valueLabel: 'en',
    means: [
      TravelMean.BIKE,
      TravelMean.CARSHARE,
      TravelMean.CAR,
      TravelMean.ECAR,
      TravelMean.REGIONAL_TRAIN,
      TravelMean.TRAIN,
      TravelMean.BUS,
      TravelMean.BOAT,
      TravelMean.PLANE,
    ],
  },
  FREIGHT: {
    unit: 'kg',
    valueLabel: 'de marchandise en',
    means: [
      TravelMean.VAN,
      TravelMean.SMALL_TRUCK,
      TravelMean.TRUCK,
      TravelMean.TRAIN,
      TravelMean.BOAT,
      TravelMean.PLANE,
    ],
  },
};

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
`;

const InputsContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  align-items: center;

  &:hover > div:first-of-type {
    opacity: 1;
  }
`;

const LabelContainer = styled.div`
  white-space: nowrap;
`;

const TravelForm = ({ travel }: { travel: Travel }) => {
  const { valueLabel, means, unit } = travelTypeConfig[travel.load];
  const { tour, removeTravel, updateTravel } = useTour();
  const { stepId } = useStep();

  if (!tour) {
    return null;
  }

  const handleClick = () => {
    stepId && removeTravel(stepId, travel.id);
  };

  const handleValueChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event?.target.value);
    if (value < 0) {
      return;
    }
    updateTravel(stepId, travel.id, { value });
  };
  const handleAlternateValueChanged = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    updateTravel(stepId, travel.id, {
      alternateValue: parseFloat(event?.target.value),
    });
  };

  const handleMeanChanged = (newMean: TravelMeanRepartition[]) => {
    updateTravel(stepId, travel.id, {
      mean: newMean,
      alternateValue: travel.alternateValue ? travel.alternateValue : 1,
    });
  };

  const handleLocationChanged =
    (key: 'from' | 'to') => (value: TravelLocation) => {
      stepId && updateTravel(stepId, travel.id, { [key]: value });
    };

  let distance: number | null = null;
  switch (travel.type) {
    case TravelType.OUT:
      const currentStep = tour.find((step) => step.id === stepId);
      if (currentStep?.location?.coordinates && travel.to?.coordinates) {
        distance = computeDistance(
          currentStep.location.coordinates,
          travel.to?.coordinates,
        );
      }
      break;
    case TravelType.IN:
      const currentStepIndex = tour.findIndex((step) => step.id === stepId);
      const nextStep = tour[currentStepIndex + 1];
      if (!nextStep) {
        break;
      }
      if (nextStep?.location?.coordinates && travel.from?.coordinates) {
        distance = computeDistance(
          travel.from?.coordinates,
          nextStep.location?.coordinates,
        );
      }
      break;
  }

  return (
    <>
      {travel.type === TravelType.OUT && (
        <InputsContainer>
          <LabelContainer>Vers</LabelContainer>
          <CityAutocomplete
            defaultValue={travel.to}
            size="small"
            onChange={handleLocationChanged('to')}
          />
          {distance !== null && (
            <LabelContainer>{Math.round(distance)} km</LabelContainer>
          )}
        </InputsContainer>
      )}
      {travel.type === TravelType.IN && (
        <InputsContainer>
          <LabelContainer>Au départ de</LabelContainer>
          <CityAutocomplete
            defaultValue={travel.from}
            size="small"
            onChange={handleLocationChanged('from')}
          />
          {distance !== null && (
            <LabelContainer>{Math.round(distance)} km</LabelContainer>
          )}
        </InputsContainer>
      )}

      <InputsContainer>
        {[TravelType.OUT, TravelType.IN].includes(travel.type) && (
          <LabelContainer>pour</LabelContainer>
        )}
        <ValueInput
          value={travel.value || ''}
          onChange={handleValueChanged}
          size="small"
          sx={{
            width: '200px',
            fontSize: '12px',
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{unit}</InputAdornment>
            ),
          }}
        />
        <LabelContainer>{valueLabel}</LabelContainer>
        <MeansInput
          means={means}
          value={travel.mean}
          onChange={handleMeanChanged}
        />
        <IconContainer>
          <ButtonWithConfirm
            component={IconButton}
            size="small"
            onConfirm={handleClick}
            modalTitle={`Suppression du trajet`}
            modalContent={
              <>
                Vous êtes sur le point de supprimer le trajet ainsi que ses
                informations.
                <br />
                Voulez-vous vraiment supprimer ce trajet ?
              </>
            }
          >
            <Delete />
          </ButtonWithConfirm>
        </IconContainer>
      </InputsContainer>
      {travel.mean?.find((mean) => mean.type === TravelMean.CARSHARE) && (
        <InputsContainer
          style={{ justifyContent: 'flex-start', marginLeft: '280px' }}
        >
          <LabelContainer>dans</LabelContainer>
          <ValueInput
            value={travel.alternateValue || ''}
            onChange={handleAlternateValueChanged}
            size="small"
            sx={{
              width: '250px',
              fontSize: '12px',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  voitures différentes
                </InputAdornment>
              ),
            }}
          />
        </InputsContainer>
      )}
    </>
  );
};

export default TravelForm;
