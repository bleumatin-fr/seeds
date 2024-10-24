import styled from '@emotion/styled';
import { useState } from 'react';

import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as yup from 'yup';
import TextField from '../project/parameters/TextField';

import BaseBlock from '../ui/Block';

import { useLocation } from 'react-router-dom';

import { useAuthentication } from './context/useAuthentication';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import Button from '../ui/Button';

import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import Fab from '@mui/material/Fab';

const Block = styled(BaseBlock)`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  width: 100%;
`;

const validationSchema = yup.object({
  object: yup.string().required('Champ obligatoire'),
  message: yup.string().required('Champ obligatoire'),
});

const Feedback = () => {
  const { search } = useLocation();
  const hideFeedback = search.includes('hideFeedback');
  const [open, setOpen] = useState(false);
  const { auth, loading, sendMessage, error: authError } = useAuthentication();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const formik = useFormik({
    initialValues: {
      object: '',
      message: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await sendMessage(values.object, values.message, location.pathname);
      enqueueSnackbar('Votre message a bien été envoyé', {
        variant: 'success',
      });
      handleClose();
    },
  });
  if (!auth) return null;
  const handleClose = () => {
    setOpen(false);
  };
  if (hideFeedback) return null;
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        id="create_modal"
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle id="scroll-dialog-title">Besoin d'aide ?</DialogTitle>
          <DialogContent dividers={true}>
            <DialogContentText
              sx={{
                fontWeight: '400',
                fontSize: '16px',
                fontFamily: "'Montserrat', sans-serif",
                margin: '16px 0 32px',
              }}
            >
              {!!authError && <Block accent>{`${authError}`}</Block>}
              <p className="hxr">
                Pour la moindre question ou suggestion concernant SEEDS,
                n'hésitez pas : <b>contactez-nous !</b> Nous vous répondrons
                dans les plus brefs, et néanmoins raisonnables, délais.
              </p>
              <br />
              <p className="hxr">
                Pour que nous puissions vous aider au mieux, merci de mentionner
                le nom de votre structure et celui de votre projet, et
                d'indiquer précisément le paramètre concerné par votre demande.
              </p>
            </DialogContentText>

            <TextField
              id="object"
              name="object"
              label="Objet"
              autoFocus
              value={formik.values.object}
              onChange={formik.handleChange}
              error={formik.touched.object && Boolean(formik.errors.object)}
              helperText={formik.touched.object && formik.errors.object}
              fullWidth
              sx={{ marginBottom: '16px' }}
            />

            <TextField
              id="message"
              name="message"
              label="Message"
              multiline
              rows={4}
              value={formik.values.message}
              onChange={formik.handleChange}
              error={formik.touched.message && Boolean(formik.errors.message)}
              helperText={formik.touched.message && formik.errors.message}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" color="primary" disabled={loading}>
              Envoyer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Fab
        sx={{
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          backgroundColor: 'var(--yellow)',
        }}
        onClick={() => setOpen(true)}
      >
        <QuestionMarkRoundedIcon />
      </Fab>
    </>
  );
};

export default Feedback;
