import { createContext, ReactNode, useContext } from 'react';

interface StepContextType {
  stepId: string;
}

export const StepContext = createContext<StepContextType>({
  stepId: '',
});
StepContext.displayName = 'StepContext';

export const Provider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: StepContextType;
}) => {
  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

const useStep = () => useContext(StepContext);

export default useStep;
