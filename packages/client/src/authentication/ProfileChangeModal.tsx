import styled from '@emotion/styled';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import * as yup from 'yup';
import TextField from '../project/parameters/TextField';
import BaseBlock from '../ui/Block';
import LoadingButton from '../ui/LoadingButton';
import useUser from './context/useUser';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 300px;
`;

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px 38px;
  width: 100%;
`;

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Entrez un email valide')
    .required('Champ obligatoire'),
});

interface ProfileChangeModalProps {
  open: boolean;
  handleClose: () => void;
}

const ProfileChangeModal = ({ open, handleClose }: ProfileChangeModalProps) => {
  const { user, loading, error, changeProfile } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      company: user?.company,
      optin: user?.optin,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await changeProfile({
        email: values.email || '',
        firstName: values.firstName || '',
        lastName: values.lastName || '',
        company: values.company || '',
        optin: values.optin || false,
      });

      enqueueSnackbar('Profil mis à jour avec succès', {
        variant: 'success',
      });
      onClose();
    },
  });

  useEffect(() => {
    formik.setValues({ ...formik.values, ...user });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onClose = () => {
    formik.resetForm();
    handleClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle id="scroll-dialog-title">Mise à jour profil</DialogTitle>
        <DialogContent dividers={true}>
          <Container>
            {!!error && <Block accent>{`${error}`}</Block>}
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
              id="firstName"
              name="firstName"
              label="Prénom"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
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
            <FormControlLabel
              control={
                <Checkbox
                  id="optin"
                  name="optin"
                  checked={formik.values.optin}
                />
              }
              disabled={loading}
              onChange={formik.handleChange}
              label="J'accepte de recevoir des informations sur SEEDS par email "
            />
          </Container>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            type="submit"
            loading={loading}
            color="primary"
            disabled={loading}
          >
            Mettre à jour
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProfileChangeModal;
