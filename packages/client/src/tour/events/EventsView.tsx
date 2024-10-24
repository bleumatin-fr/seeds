import styled from '@emotion/styled';
import { SyntheticEvent, useState } from 'react';

import { TourEvent } from '../context/types';
import { Provider as EventProvider } from './useEvent';

import EventForm from './EventForm';

const TourEventsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: stretch;
`;

const TourEventsList = styled.div`
  flex-grow: 1;
  display: flex;
  gap: 16px;
  flex-direction: column;
`;

const EventsView = ({ events }: { events?: TourEvent[] }) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const handleExpandedChange =
    (id: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? id : false);
    };

  if (!events || !events.length) {
    return null;
  }

  return (
    <TourEventsContainer>
      <TourEventsList>
        {events
          .sort((a, b) => a.order - b.order)
          .map((event) => (
            <EventProvider value={{ eventId: event.id }} key={event.id}>
              <EventForm
                key={event.id}
                event={event}
                expanded={expanded}
                onExpandedChange={handleExpandedChange(event.id)}
              />
            </EventProvider>
          ))}
      </TourEventsList>
    </TourEventsContainer>
  );
};

export default EventsView;
