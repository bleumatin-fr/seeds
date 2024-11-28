import styled from '@emotion/styled';
import { MouseEvent, useState } from 'react';

import Button from '../ui/Button';
import CheckIcon from '../ui/icons/check.svg?react';
import BaseLoadingButton from '../ui/LoadingButton';
import { Step, Tour, Travel, TravelLoad } from './context/types';
import useTour from './context/useTour';
import formatDates from './travel/formatDates';

const LoadingButton = styled(BaseLoadingButton)`
  align-self: center;
`;

const Container = styled.div`
  position: sticky;
  min-width: 300px;
  flex-shrink: 0;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.p`
  font-weight: 600;
  font-size: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const TourSynthesis = ({
  onValidate,
}: {
  onValidate: (tour: Tour) => Promise<void>;
}) => {
  const { tour } = useTour();
  return (
    <Container>
      {tour && tour.length >= 3 && <TourSteps />}
      <TourData onValidate={onValidate} />
    </Container>
  );
};

const TourStepsContainer = styled.div`
  width: 100%;
  background-color: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  min-height: 260px;
  gap: 6px;
`;

const TourStepsTable = styled.div``;
const TourStepsContent = styled.div`
  flex-grow: 1;
`;

const StepWrapper = styled.div`
  cursor: pointer;
  gap: 10px;
  display: flex;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 16px;

  &:hover {
    text-decoration: underline;
  }
`;

const DateWrapper = styled.div`
  width: 35%;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
`;

const CityWrapper = styled.div`
  width: 60%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TourSteps = () => {
  const { tour, addStep, setExpanded } = useTour();

  if (!tour) {
    return null;
  }

  const handleAddStepClicked = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    addStep();
    setExpanded(tour.length, 'location');
  };

  const handleStepClicked = (stepIndex: number) => () => {
    setExpanded(stepIndex, 'location');
    document.getElementById(`location-${stepIndex}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  };

  return (
    <TourStepsContainer>
      <Title>Calculateur mobilité</Title>
      <TourStepsContent>
        <TourStepsTable>
          {tour?.map((step, index) => {
            if (index === 0) {
              return null;
            }
            const formattedDates = formatDates(
              step.events
                .filter(({ date }) => !!date)
                .map(({ date }) => date) as Date[],
            ).join(', ');
            return (
              <StepWrapper onClick={handleStepClicked(index)} key={step.id}>
                <DateWrapper>
                  {formattedDates ? formattedDates : '?? ???'}
                </DateWrapper>
                <CityWrapper title={step.location?.name ?? 'Lieu inconnu'}>
                  {step.location?.name ?? 'Lieu inconnu'}
                </CityWrapper>
              </StepWrapper>
            );
          })}
        </TourStepsTable>
      </TourStepsContent>
      <Button onClick={handleAddStepClicked}>Ajouter une étape</Button>
    </TourStepsContainer>
  );
};

const TourDataContainer = styled.div`
  width: 100%;
  background-color: var(--lightgreen);
  border-radius: 4px;
  padding: 16px;
  gap: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const DataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  p {
    font-weight: 400;
    font-size: 16px;
    text-align: center;
    b {
      font-weight: 600;
      font-size: 20px;
    }
  }
`;

const getNumberOfTravels = (
  steps: Step[],
  reduce: (travels: Travel[]) => number = (travels) => travels.length,
) =>
  steps.reduce(
    (nbOfTravels: number, step) => nbOfTravels + reduce(step.travels),
    0,
  );

const isPassenger = (travel: Travel) => travel.load === TravelLoad.PASSENGER;
const isFreight = (travel: Travel) => travel.load === TravelLoad.FREIGHT;

const TourData = ({
  onValidate,
}: {
  onValidate: (tour: Tour) => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  const { tour } = useTour();
  if (!tour) {
    return null;
  }
  const data = [
    {
      number: tour.length - 1,
      unit: tour.length - 1 > 1 ? 'étapes' : 'étape',
    },
    {
      number: getNumberOfTravels(
        tour,
        (travels) => travels.filter(isPassenger).length,
      ),
      unit: 'trajet de personnes',
    },
    {
      number: getNumberOfTravels(
        tour,
        (travels) => travels.filter(isFreight).length,
      ),
      unit: 'trajet de marchandises',
    },
  ];

  let dateDescription: string | null = null;
  const allDates = tour.reduce(
    (dates, step) => [
      ...dates,
      ...(step.events
        .filter(({ date }) => !!date)
        .map(({ date }) => date) as Date[]),
    ],
    [] as Date[],
  );

  if (allDates.length > 1) {
    const minDate = new Date(
      Math.min(...allDates.map((date) => new Date(date).getTime())),
    );
    const maxDate = new Date(
      Math.max(...allDates.map((date) => new Date(date).getTime())),
    );
    const [from, to] = formatDates([minDate, maxDate]);
    dateDescription = `Du ${from} au ${to}`;
  }

  const handleOnValidate = async () => {
    setLoading(true);
    await onValidate({ steps: tour });
    setLoading(false);
  };
  return (
    <TourDataContainer>
      <Title>En un coup d'oeil...</Title>
      <DataWrapper>
        {data.map((row, index) => (
          <p key={index}>
            <b>{row.number}</b> {row.unit}
          </p>
        ))}
        {dateDescription && (
          <p style={{ marginTop: '24px' }}>{dateDescription}</p>
        )}
      </DataWrapper>
      <LoadingButton
        loading={loading}
        onClick={handleOnValidate}
        startIcon={<CheckIcon stroke="black" />}
        id="validate-tour"
      >
        Valider
      </LoadingButton>
    </TourDataContainer>
  );
};

export default TourSynthesis;
