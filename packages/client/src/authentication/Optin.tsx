import styled from '@emotion/styled';
import {
  Dialog as BaseDialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import BaseBlock from '../ui/Block';
import { ReactComponent as NewsletterIllustration } from '../ui/icons/agir.svg';
import LoadingButton from '../ui/LoadingButton';
import useConfiguration from '../useConfiguration';
import useUser from './context/useUser';

const Dialog = styled(BaseDialog)`
  form {
    width: 550px;

    > svg {
      width: 30%;
      height: 100%;
      top: 0;
      left: 0;
      position: absolute;
      padding: 16px;
      background: var(--yellow);
    }

    > :not(svg) {
      margin-left: 35%;
    }
  }
`;

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

const OptinModal = () => {
  const { configuration } = useConfiguration();
  const { user, loading, error, changeProfile } = useUser();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      optin: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!user) return;
      await changeProfile({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        company: user.company || '',
        optin: values.optin || false,
      });

      enqueueSnackbar('Préférences enregistrées', {
        variant: 'success',
      });
      onClose();
    },
  });

  useEffect(() => {
    formik.setValues({ ...formik.values, ...user });
    if (user && user?.optin === undefined) {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onCancel = async () => {
    await changeProfile({
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: user?.company || '',
      optin: false,
    });

    enqueueSnackbar('Préférences enregistrées', {
      variant: 'success',
    });
    onClose();
  };

  const onClose = () => {
    formik.resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <form onSubmit={formik.handleSubmit}>
        <NewsletterIllustration />
        <DialogTitle id="scroll-dialog-title">Nouvelle Newsletter!</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            sx={{
              fontWeight: '400',
              fontSize: '16px',
              fontFamily: "'Montserrat', sans-serif",
              margin: '16px 0 32px',
            }}
          >
            <p
              className="hxr"
              dangerouslySetInnerHTML={{
                __html: configuration['home.optinMessage'],
              }}
            ></p>
          </DialogContentText>
          <Container>{!!error && <Block accent>{`${error}`}</Block>}</Container>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'flex-start' }}>
          <LoadingButton onClick={onCancel} type="button">
            Pas pour l'instant
          </LoadingButton>
          <LoadingButton
            type="submit"
            loading={loading}
            color="primary"
            disabled={loading}
          >
            S'inscrire
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OptinModal;
