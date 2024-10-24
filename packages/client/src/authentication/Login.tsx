import styled from '@emotion/styled';
import { SyntheticEvent, useState } from 'react';

import { Divider } from '@mui/material';
import {
  Link,
  Location as RouterLocation,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import TextField from '../project/parameters/TextField';
import BaseBlock from '../ui/Block';
import LoadingButton from '../ui/LoadingButton';
import { useAuthentication } from './context/useAuthentication';

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Block = styled(BaseBlock)`
  display: flex;
  width: 400px;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px 38px;
`;

const ErrorBlock = styled(BaseBlock)`
  width: 100%;
`;

const SideActionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  font-size: 0.8rem;
  margin-top: 16px;
  align-items: center;
`;

const Login = () => {
  const { loading, login, error: authError } = useAuthentication();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let originLocation: RouterLocation | null = null;
  let error: string | null = null;
  if (state) {
    if ((state as any).originLocation) {
      originLocation = (state as any).originLocation;
    }
    if ((state as any).error) {
      error = (state as any).error;
    }
  }

  const handleFormSubmitted = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    await login(email, password);
    navigate(originLocation ?? '/');
  };

  return (
    <Container>
      <form onSubmit={handleFormSubmitted}>
        <Block>
          <h2>Connexion</h2>
          {error && <ErrorBlock accent>{error}</ErrorBlock>}
          {!!authError && (
            <ErrorBlock accent>Utilisateur ou mot de passe erronés</ErrorBlock>
          )}
          <TextField
            name="email"
            label="Adresse email"
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            fullWidth
          ></TextField>
          <TextField
            type="password"
            name="password"
            label="Mot de passe"
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            fullWidth
          ></TextField>
          <LoadingButton
            type="submit"
            loading={loading}
            color="primary"
            disabled={loading}
          >
            S'authentifier
          </LoadingButton>
          <SideActionsContainer>
            <Link to="/authentication/register">Inscription</Link>
            <Divider orientation="vertical" flexItem />
            <Link to={`/authentication/recover/${email}`}>
              Récupération mot de passe
            </Link>
          </SideActionsContainer>
        </Block>
      </form>
    </Container>
  );
};

export default Login;
