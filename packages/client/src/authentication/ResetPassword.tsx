import styled from '@emotion/styled';
import * as yup from 'yup';

import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  password: yup
    .string()
    .min(8, 'Votre mot de passe doit contenir au moins 8 caractères')
    .required('Champ obligatoire'),
});

interface ResetPasswordProps {
  title: string;
  fieldLabel: string;
  successMessage: string;
  buttonLabel: string;
}

const ResetPassword = ({
  title,
  fieldLabel,
  successMessage,
  buttonLabel,
}: ResetPasswordProps) => {
  const { loading, error, resetPassword } = useAuthentication();
  const { token } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (!token) return;
      await resetPassword(token, values.password);

      enqueueSnackbar(successMessage, {
        variant: 'success',
      });

      navigate('/');
    },
  });

  return (
    <Container>
      <form onSubmit={formik.handleSubmit}>
        <Block>
          <h2>{title}</h2>
          {!!error && <ErrorBlock accent>{`${error}`}</ErrorBlock>}
          <TextField
            id="password"
            name="password"
            type="password"
            label={fieldLabel}
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
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
            {buttonLabel}
          </LoadingButton>
          <SideActionsContainer>
            <Link to="/authentication/login">Connexion</Link>
          </SideActionsContainer>
        </Block>
      </form>
    </Container>
  );
};

export default ResetPassword;
