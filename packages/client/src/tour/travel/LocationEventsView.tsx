import styled from '@emotion/styled';
import { IconButton } from '@mui/material';
import { MouseEvent } from 'react';
import { AddButton } from '../../ui/Button';
import ButtonWithConfirm from '../../ui/ButtonWithConfirm';
import { ReactComponent as Add } from '../../ui/icons/add.svg';
import { ReactComponent as Delete } from '../../ui/icons/delete.svg';
import { ReactComponent as Edit } from '../../ui/icons/edit.svg';
import { TourEvent, TravelLocation } from '../context/types';
import useStep from '../context/useStep';
import useTour from '../context/useTour';
import EventsView from '../events/EventsView';
import LocationForm from '../LocationForm';
import formatDates from './formatDates';

type BlockProps = {
  backgroundColor?: string;
  withBorder?: boolean;
};

const Block = styled.div`
  width: fit-content;
  height: fit-content;
  border-radius: 32px;
  margin: auto;
  border: ${(props: BlockProps) =>
    props.withBorder ? '1px solid black' : 'none'};
  padding: 12px 16px;
  background-color: ${(props: BlockProps) =>
    props.backgroundColor ? props.backgroundColor : 'white'};
  cursor: pointer;
  scroll-margin-top: 50vh;
  scroll-margin-bottom: 50vh;
`;

const LocationOpened = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const LocationClosedWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  > p {
    white-space: nowrap;
  }
`;

const DateWrapper = styled.p`
  font-weight: 400;
  font-size: 12px;
  width: 100%;
  background-color: #fff1d2;
  border-radius: 32px;
  padding: 8px 12px;
  text-align: center;
`;

interface LocationClosedProps {
  dates: Date[];
  city: string;
  nbEvents: number;
  onEdit: (event: MouseEvent<HTMLButtonElement>) => void;
  onDelete: (event: MouseEvent<HTMLButtonElement>) => void;
}

const IconContainer = styled.div`
  width: 24px;
  height: 24px;

  button {
    padding: 0;
  }
`;

const DayContainer = styled.span`
  font-weight: 600;
`;
const RestOfDateContainer = styled.span``;

const DateContainer = styled.span`
  &:not(:last-child) {
    &::after {
      content: ', ';
    }
  }
`;

const LocationContainer = styled.p`
  font-weight: 600;
  font-size: 16px;
`;

const EventCountContainer = styled.p`
  font-weight: 400;
  font-size: 16px;
`;

export const LocationClosed = ({
  dates,
  city,
  nbEvents,
  onEdit,
  onDelete,
}: LocationClosedProps) => {
  return (
    <LocationClosedWrapper>
      {dates && dates.length !== 0 && (
        <DateWrapper>
          {formatDates(dates).map((date) => {
            const [day, ...rest] = date.split(' ');
            return (
              <DateContainer key={date}>
                <DayContainer>{day}</DayContainer>
                {rest.length ? ' ' : ''}
                <RestOfDateContainer>{rest.join(' ')}</RestOfDateContainer>
              </DateContainer>
            );
          })}
        </DateWrapper>
      )}
      {city && <LocationContainer>{city}</LocationContainer>}
      {nbEvents !== 0 && (
        <EventCountContainer>{nbEvents} représentation(s)</EventCountContainer>
      )}
      <IconContainer>
        <IconButton onClick={onEdit} size="small">
          <Edit />
        </IconButton>
      </IconContainer>
      <IconContainer>
        <ButtonWithConfirm
          component={IconButton}
          size="small"
          onConfirm={onDelete}
          modalTitle={`Suppression de l'étape`}
          modalContent={
            <>
              Vous êtes sur le point de supprimer l'étape ainsi que ses
              informations et tous ses trajets.
              <br />
              Voulez-vous vraiment supprimer cette étape ?
            </>
          }
        >
          <Delete />
        </ButtonWithConfirm>
      </IconContainer>
    </LocationClosedWrapper>
  );
};

const ButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

interface LocationEventsViewProps {
  location?: TravelLocation;
  events: TourEvent[];
}

const LocationEventsView = ({ location, events }: LocationEventsViewProps) => {
  const { tour, addEvent, removeStep, expanded, setExpanded } = useTour();
  const { stepId } = useStep();

  const stepIndex = tour?.findIndex((step) => step.id === stepId);
  const isExpanded =
    expanded?.index === stepIndex && expanded?.type === 'location';

  if (stepIndex === undefined) {
    return null;
  }

  const handleAddEventClicked = () => {
    addEvent(stepId);
  };

  const handleOnExpand = (
    event: MouseEvent<HTMLDivElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    if (isExpanded) {
      return;
    }
    setExpanded && setExpanded(stepIndex, 'location');
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    removeStep(stepId);
  };

  return (
    <Block
      backgroundColor="var(--yellow)"
      onClick={handleOnExpand}
      id={`location-${stepIndex}`}
      data-tour="tour-transport-step"
    >
      {!isExpanded && (
        <LocationClosed
          dates={
            events
              .filter(({ date }) => !!date)
              .map(({ date }) => date) as Date[]
          }
          nbEvents={events.length}
          onEdit={handleOnExpand}
          city={location?.name || ''}
          onDelete={handleDelete}
        />
      )}
      {isExpanded && (
        <LocationOpened>
          <LocationForm
            location={location}
            label={"Lieu de l'étape"}
            icon={undefined}
          />
          <EventsView events={events} />
          <ButtonWrapper>
            <AddButton onClick={handleAddEventClicked} startIcon={<Add />}>
              Ajouter une représentation
            </AddButton>
          </ButtonWrapper>
        </LocationOpened>
      )}
    </Block>
  );
};

export default LocationEventsView;
