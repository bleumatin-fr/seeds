import styled from '@emotion/styled';
import { CSSProperties, MouseEvent, RefObject, useEffect, useRef } from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { ArcherContainerHandle } from 'react-archer/lib/ArcherContainer/ArcherContainer.types';
import { Travel, TravelType } from './context/types';

import useStep, { Provider as StepProvider } from './context/useStep';
import useTour from './context/useTour';

import LocationEventsView from './travel/LocationEventsView';
import TravelsView from './travel/TravelsView';

import { ReactComponent as Flag } from '../ui/icons/flag.svg';
import TravelsForm from './travel/TravelsForm';

import { NoBorderButton } from '../ui/Button';
import { ReactComponent as Add } from '../ui/icons/add.svg';

const StepsContainer = styled.div``;

const StepContainer = styled.div`
  flex-shrink: 1;
  flex-grow: 0;
`;

const StartStepContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  min-height: 240px;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
`;

const StartStepLabelContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StartStepTravelFormContainer = styled.div`
  margin: 60px 0;
`;

const StartStep = ({ travels }: { travels: Travel[] }) => {
  const archerRef = useRef<ArcherContainerHandle>();

  const inTravels = travels
    .filter((travel) => travel.type === TravelType.IN)
    .sort((a, b) => a.order - b.order);

  useEffect(() => {
    const interval = setInterval(() => {
      archerRef.current?.refreshScreen();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <ArcherContainer
      ref={archerRef as RefObject<ArcherContainerHandle>}
      strokeColor="grey"
      strokeWidth={2}
      className="start-step"
    >
      <StartStepContainer>
        <StartStepLabelContainer>
          <Flag></Flag> Départ
          <ArcherElement
            id="toFirst1"
            relations={[
              {
                targetId: 'toFirst2',
                targetAnchor: 'top',
                sourceAnchor: 'bottom',
                style: { strokeDasharray: '5,5' },
              },
            ]}
          >
            <div
              style={{ position: 'absolute', bottom: '-10px', left: '50%' }}
            ></div>
          </ArcherElement>
        </StartStepLabelContainer>
        <StartStepTravelFormContainer>
          <TravelsForm travels={inTravels} type={TravelType.IN} />
        </StartStepTravelFormContainer>
        <ArcherElement id="toFirst2">
          <div style={{ position: 'absolute', bottom: 0, left: '50%' }}></div>
        </ArcherElement>
      </StartStepContainer>
    </ArcherContainer>
  );
};

const EndStepContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  min-height: 360px;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
}
`;

const EndStepLabelContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const EndStep = ({ travels }: { travels: Travel[] }) => {
  const archerRef = useRef<ArcherContainerHandle>();
  const { tour, addStep, setExpanded } = useTour();
  const { stepId } = useStep();

  useEffect(() => {
    const interval = setInterval(() => {
      archerRef.current?.refreshScreen();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!tour) {
    return null;
  }

  const handleAddStepClicked = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    stepId && addStep(stepId);
    setExpanded(tour.length, 'location');
  };

  return (
    <ArcherContainer
      ref={archerRef as RefObject<ArcherContainerHandle>}
      strokeColor="grey"
      strokeWidth={2}
      className="end-step"
    >
      <EndStepContainer>
        <TravelsForm travels={travels} type={TravelType.OUT} />
        <AddStepButton onClick={handleAddStepClicked} />

        <EndStepLabelContainer>
          <Flag></Flag> Arrivée
          <ArcherElement id="fromLast2">
            <div
              style={{ position: 'absolute', top: '-10px', left: '50%' }}
            ></div>
          </ArcherElement>
        </EndStepLabelContainer>

        <ArcherElement
          id="fromLast1"
          relations={[
            {
              targetId: 'fromLast2',
              targetAnchor: 'top',
              sourceAnchor: 'bottom',
              style: { strokeDasharray: '5,5' },
            },
          ]}
        >
          <div style={{ position: 'absolute', top: 0, left: '50%' }}></div>
        </ArcherElement>
      </EndStepContainer>
    </ArcherContainer>
  );
};

const BackgroundCurtain = styled.div`
  background-color: var(--backgroundColor);
`;

const CustomNoBorderButton = styled(NoBorderButton)`
  background-color: var(--yellow) !important;
  padding: 16px;
  height: 56px;
  opacity: 0.6;
  transition: opacity 450ms linear;

  &:hover {
    opacity: 1;
  }
`;

const AddStepButton = ({
  onClick,
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <BackgroundCurtain>
      <CustomNoBorderButton onClick={onClick} startIcon={<Add />} id="add-step">
        Ajouter une étape
      </CustomNoBorderButton>
    </BackgroundCurtain>
  );
};

interface TourProps {
  style?: CSSProperties | undefined;
}

const Tour = ({ style }: TourProps) => {
  const { tour, expanded, setExpanded } = useTour();

  useEffect(() => {
    if (expanded === null) {
      return;
    }
    document
      .getElementById(`${expanded.type}-${expanded.index}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
  }, [expanded]);

  if (!tour) {
    return null;
  }

  const handleOnClick = (event: MouseEvent<HTMLDivElement>) => {
    setExpanded(null);
  };

  return (
    <StepsContainer style={style} onClick={handleOnClick} id="tour-layout">
      {tour
        ?.sort((a, b) => a.order - b.order)
        .map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === tour.length - 1;
          if (isFirst) {
            return (
              <StepContainer key={step.id}>
                <StepProvider value={{ stepId: step.id }}>
                  <StartStep travels={step.travels}></StartStep>
                </StepProvider>
              </StepContainer>
            );
          }
          if (isLast) {
            return (
              <StepContainer key={step.id}>
                <StepProvider value={{ stepId: step.id }}>
                  <LocationEventsView
                    location={step.location}
                    events={step.events}
                  />
                  <EndStep travels={step.travels}></EndStep>
                </StepProvider>
              </StepContainer>
            );
          }
          return (
            <StepContainer key={step.id} className="middle-step">
              <StepProvider value={{ stepId: step.id }}>
                <LocationEventsView
                  location={step.location}
                  events={step.events}
                />
                <TravelsView
                  travels={step.travels}
                  disabledTravelTypes={step.disabledTravelTypes || []}
                />
              </StepProvider>
            </StepContainer>
          );
        })}
    </StepsContainer>
  );
};

export default Tour;
