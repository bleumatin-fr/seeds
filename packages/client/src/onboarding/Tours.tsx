import { useAuthentication } from '../authentication/context/useAuthentication';
import TransportationTour from './tours/TransportationTour';
import useOnboarding from './useOnboarding';

interface ToursProps {
  children: React.ReactNode;
}

const ActualTours = ({ children }: ToursProps) => {
  const { enabledTour } = useOnboarding();

  if (enabledTour === 'transport') {
    return <TransportationTour>{children}</TransportationTour>;
  }
  return <>{children}</>;
};

export const Tours = ({ children }: ToursProps) => {
  const { auth } = useAuthentication();
  if (!auth || !auth.token) {
    return <>{children}</>;
  }
  return <ActualTours>{children}</ActualTours>;
};
