import styled from '@emotion/styled';
import * as yup from 'yup';

import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
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
  password: yup
    .string()
    .min(8, 'Votre mot de passe doit contenir au moins 8 caractères')
    .required('Champ obligatoire'),
  tos: yup
    .boolean()
    .oneOf([true], "Vous devez accepter les conditions d'utilisation"),
});

const Register = () => {
  const {
    loading,
    login,
    error: authError,
    register: registerUser,
  } = useAuthentication();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      company: '',
      optin: false,
      tos: false,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await registerUser({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        company: values.company,
        optin: values.optin,
      });

      await login(values.email, values.password);

      navigate('/');
    },
  });

  return (
    <Container>
      <form onSubmit={formik.handleSubmit}>
        <Block>
          <h2>Inscription</h2>
          {!!authError && <ErrorBlock accent>{`${authError}`}</ErrorBlock>}
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
          <TextField
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={loading}
            fullWidth
          ></TextField>
          <Divider />
          <TextField
            id="firstName"
            name="firstName"
            label="Prénom"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            disabled={loading}
            fullWidth
          ></TextField>
          <TextField
            id="lastName"
            name="lastName"
            label="Nom"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            disabled={loading}
            fullWidth
          ></TextField>
          <TextField
            id="company"
            name="company"
            label="Société"
            value={formik.values.company}
            onChange={formik.handleChange}
            error={formik.touched.company && Boolean(formik.errors.company)}
            helperText={formik.touched.company && formik.errors.company}
            disabled={loading}
            fullWidth
          ></TextField>
          <FormControl
            required
            error={formik.touched.tos && Boolean(formik.errors.tos)}
          >
            <FormControlLabel
              control={
                <Checkbox id="tos" name="tos" checked={formik.values.tos} />
              }
              disabled={loading}
              onChange={formik.handleChange}
              label={
                <>
                  J'accepte les{' '}
                  <a
                    href="https://arviva.org/mentions-legales"
                    target="_blank"
                    rel="noreferrer"
                  >
                    conditions d'utilisation de SEEDS
                  </a>
                </>
              }
            />
            {formik.touched.tos && formik.errors.tos && (
              <FormHelperText>{formik.errors.tos}</FormHelperText>
            )}
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox id="optin" name="optin" checked={formik.values.optin} />
            }
            disabled={loading}
            onChange={formik.handleChange}
            label="J'accepte de recevoir des informations sur SEEDS par email "
          />
          <LoadingButton
            type="submit"
            loading={loading}
            color="primary"
            disabled={loading}
            fullWidth
          >
            S'inscrire
          </LoadingButton>
          <SideActionsContainer>
            <Link to="/authentication/login">Connexion</Link>
          </SideActionsContainer>
        </Block>
      </form>
    </Container>
  );
};

export default Register;
