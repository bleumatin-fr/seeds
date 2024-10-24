import styled from '@emotion/styled';
import * as yup from 'yup';

import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { Link, useParams } from 'react-router-dom';
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
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px 38px;
  width: 400px;
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

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Entrez un email valide')
    .required('Champ obligatoire'),
});

const Recover = () => {
  const { loading, error, recover } = useAuthentication();
  const { email } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await recover(values.email!);

      enqueueSnackbar('Un email vient de vous être envoyé', {
        variant: 'success',
      });
    },
  });

  return (
    <Container>
      <form onSubmit={formik.handleSubmit}>
        <Block>
          <h2>Récupération de mot de passe</h2>
          {!!error && <ErrorBlock accent>{`${error}`}</ErrorBlock>}
          <TextField
            id="email"
            name="email"
            label="Adresse email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
            fullWidth
          ></TextField>
          <LoadingButton
            type="submit"
            loading={loading}
            color="primary"
            disabled={loading}
            fullWidth
          >
            Récupérer
          </LoadingButton>
          <SideActionsContainer>
            <Link to="/authentication/login">Connexion</Link>
          </SideActionsContainer>
        </Block>
      </form>
    </Container>
  );
};

export default Recover;
