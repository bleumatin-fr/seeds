import { createContext, ReactNode, useContext } from 'react';

interface EventContextType {
  eventId: string;
}

export const EventContext = createContext<EventContextType>({
  eventId: '',
});
EventContext.displayName = 'TourContext';

export const Provider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: EventContextType;
}) => {
  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

const useEvent = () => useContext(EventContext);

export default useEvent;
