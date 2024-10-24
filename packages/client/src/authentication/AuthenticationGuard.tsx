import { Component, ReactNode } from 'react';
import {
  Location as RouterLocation,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { useAuthentication } from './context/useAuthentication';

interface ErrorBoundaryProps {
  children?: ReactNode;
  location: RouterLocation;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (error.message === 'Unauthorized') {
      localStorage.removeItem('auth');
      return { hasError: true };
    }
    return { hasError: false };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Navigate
          to="/authentication/login"
          replace
          state={{
            originLocation: this.props.location,
            error: 'Veuillez vous authentifier pour accéder à la page',
          }}
        />
      );
    }

    return this.props.children;
  }
}

interface AuthenticationGuardProps {
  children: ReactNode;
  suppressError?: boolean;
}

const AuthenticationGuard = ({
  children,
  suppressError,
}: AuthenticationGuardProps) => {
  const { auth } = useAuthentication();
  const location = useLocation();

  if (!auth || !auth.token) {
    if (suppressError) return null;
    return (
      <Navigate
        to="/authentication"
        replace
        state={{ originLocation: location }}
      />
    );
  }

  return <ErrorBoundary location={location}>{children}</ErrorBoundary>;
};

export default AuthenticationGuard;
