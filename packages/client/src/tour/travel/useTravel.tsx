import { createContext, ReactNode, useContext } from 'react';

interface TravelContextType {
  travelId: string;
}

export const TravelContext = createContext<TravelContextType>({
  travelId: '',
});

export const Provider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: TravelContextType;
}) => {
  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  );
};

const useTravel = () => useContext(TravelContext);

export default useTravel;
