import styled from '@emotion/styled';
import { Divider } from '@mui/material';
import { MouseEvent } from 'react';

import { AddButton } from '../../ui/Button';
import { ReactComponent as Add } from '../../ui/icons/add.svg';
import { ReactComponent as Freight } from '../../ui/icons/categories/marchandise.svg';
import { ReactComponent as Edit } from '../../ui/icons/edit.svg';
import { ReactComponent as People } from '../../ui/icons/PERS.svg';
import { ReactComponent as Send } from '../../ui/icons/send.svg';
import { Travel, TravelLoad, TravelType } from '../context/types';
import useStep from '../context/useStep';
import useTour from '../context/useTour';
import computeDistance from './computeDistance';
import TravelForm from './TravelForm';

type BlockProps = {
  backgroundColor?: string;
  withBorder?: boolean;
};

const Block = styled.div`
  width: fit-content;
  height: fit-content;
  border-radius: 32px;
  border: ${(props: BlockProps) =>
    props.withBorder ? '1px solid black' : 'none'};
  padding: 8px;
  background-color: ${(props: BlockProps) =>
    props.backgroundColor
      ? props.backgroundColor
      : props.withBorder
      ? 'var(--backgroundColor)'
      : 'white'};
  transition: background-color 450ms linear;
  cursor: pointer;
  position: relative;
  z-index: ${(props: BlockProps) => (props.withBorder ? 1 : 3)};
  &:hover {
    background-color: white;
  }
  scroll-margin-top: 100px;
  scroll-margin-bottom: 100px;
`;

const TravelSynthesisWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-weight: 400;
  font-size: 16px;
`;

const StatWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  cursor: pointer;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
`;

const getTravelStats = (travels: Travel[]) => {
  let nb: { [key: string]: number } = {
    FREIGHT: 0,
    PASSENGER: 0,
  };
  travels.forEach((travel) => {
    nb[travel.load] += travel.value || 0;
  });
  nb.travels = travels.length;
  return { nb };
};

const TravelSynthesis = ({
  className,
  travels,
  emptyLabel,
}: {
  className: string;
  travels: Travel[];
  emptyLabel: string;
}) => {
  const stats = getTravelStats(travels);
  const isEmpty = travels.length === 0;

  return (
    <TravelSynthesisWrapper className={className}>
      {isEmpty && <p className="hxr">{emptyLabel}</p>}
      {!isEmpty && (
        <>
          <StatWrapper>
            <Send />
            <p className="h6r">{stats.nb.travels}</p>
          </StatWrapper>
          <StatWrapper>
            <People />
            <p className="h6r">{stats.nb.PASSENGER}</p>
          </StatWrapper>
          <StatWrapper>
            <Freight />
            <p className="h6r">{stats.nb.FREIGHT}</p>
          </StatWrapper>
        </>
      )}
      <IconContainer>
        <Edit />
      </IconContainer>
    </TravelSynthesisWrapper>
  );
};

const TravelsOpened = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const travelTypeLabels = {
  [TravelType.DIRECT]: 'directs',
  [TravelType.OUT]: 'sortants',
  [TravelType.IN]: 'entrants',
};

const TravelsDescription = ({ type }: { type: TravelType }) => {
  const { tour } = useTour();
  const { stepId } = useStep();

  if (!tour) {
    return null;
  }

  let distance: number | null = null;
  let from = '';
  let to = '';
  const currentStepIndex = tour.findIndex((step) => step.id === stepId);
  const thisAndNextStep = tour.slice(currentStepIndex, currentStepIndex + 2);
  if (thisAndNextStep?.length === 2) {
    if (thisAndNextStep[0].location && thisAndNextStep[1].location) {
      distance = computeDistance(
        thisAndNextStep[0].location.coordinates,
        thisAndNextStep[1].location.coordinates,
      );
      from = thisAndNextStep[0].location.name;
      to = thisAndNextStep[1].location.name;
    }
  }

  if (distance === null) {
    return null;
  }

  if (from && to && type === TravelType.DIRECT) {
    return (
      <p>
        Trajets de {from} à {to}: {Math.round(distance)} km
      </p>
    );
  }
  if (from && type === TravelType.OUT) {
    return <p>Trajets au départ de {from}</p>;
  }
  if (to && type === TravelType.IN) {
    return <p>Trajets vers {to}</p>;
  }

  return null;
};

const TravelsForm = ({
  travels,
  type,
}: {
  travels: Travel[];
  type: TravelType;
}) => {
  const { tour, addTravel, expanded, setExpanded } = useTour();
  const { stepId } = useStep();
  if (!tour) {
    return null;
  }

  const stepIndex = tour.findIndex((step) => step.id === stepId);
  const isExpanded = expanded?.index === stepIndex && expanded.type === type;

  const handleOnBlockClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!isExpanded) {
      setExpanded(stepIndex, type);
    }
  };

  return (
    <Block
      withBorder={!isExpanded}
      onClick={handleOnBlockClick}
      id={`${type}-${stepIndex}`}
      className={type}
    >
      {!isExpanded && (
        <TravelSynthesis
          travels={travels}
          className="travel-synthesis"
          emptyLabel={`Entrez vos trajets ${travelTypeLabels[type]}`}
        />
      )}
      {isExpanded && (
        <TravelsOpened>
          {travels.length !== 0 && <TravelsDescription type={type} />}
          {!travels.length && (
            <p className="hxr" style={{ whiteSpace: 'nowrap' }}>
              Entrez vos trajets {travelTypeLabels[type]}
            </p>
          )}
          {travels
            .sort((a, b) => a.order - b.order)
            .map((travel, index) => (
              <div key={travel.id}>
                <TravelForm travel={travel} />
                {index !== travels.length - 1 && <Divider />}
              </div>
            ))}
          <ButtonWrapper>
            <AddButton
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                stepId && addTravel(stepId, type, TravelLoad.PASSENGER);
              }}
              startIcon={<Add />}
              size="small"
              id="add-person"
            >
              Personnes
            </AddButton>
            <AddButton
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                stepId && addTravel(stepId, type, TravelLoad.FREIGHT);
              }}
              startIcon={<Add />}
              size="small"
              id="add-merchandise"
            >
              Marchandise
            </AddButton>
          </ButtonWrapper>
        </TravelsOpened>
      )}
    </Block>
  );
};

export default TravelsForm;
