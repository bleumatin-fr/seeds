import { Project, ProjectUser } from '@arviva/core';
import { useSnackbar } from 'notistack';
import { MouseEvent, useEffect, useState } from 'react';
import TextField from './parameters/TextField';

import Block from '../ui/Block';

import { useProject } from './context/useProject';

import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import React from 'react';

import Button from '../ui/Button';

import { useFormik } from 'formik';
import * as yup from 'yup';

import { User } from '../authentication/context/useUser';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
}

const validationSchema = yup.object({
  email: yup.string().required('Champ obligatoire'),
});

const ShareProject = ({ open, onClose, project }: Props) => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="scroll-dialog-title">Partager le projet</DialogTitle>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="Ajouter un utilisateur" />
        <Tab label="Gérer les utilisateurs existants" />
      </Tabs>
      <div hidden={value !== 0}>
        <AddNewUser project={project} onClose={onClose} open={open} />
      </div>
      <div hidden={value !== 1}>
        <ManageUsers project={project} onClose={onClose} open={open} />
      </div>
    </Dialog>
  );
};

const AddNewUser = ({ project, onClose }: Props) => {
  const { shareProject, loading } = useProject(project?._id.toString());
  const { enqueueSnackbar } = useSnackbar();
  const formik = useFormik({
    initialValues: {
      email: '',
      message: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const { email, message } = values;
      try {
        await shareProject({
          email,
          message,
        });
        enqueueSnackbar("L'utilisateur a bien été ajouté à votre projet", {
          variant: 'success',
        });
      } catch (e) {
        enqueueSnackbar(
          "L'utilisateur n'a pas pu être ajouté à votre projet, vérifiez l'adresse email ou réessayez plus tard",
          {
            variant: 'error',
          },
        );
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogContent
        dividers={true}
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <DialogContentText className="hxr">
          Vous pouvez partager votre projet avec d'autres utilisateurs de SEEDS.
          Pour ce faire, entrez leur email. Vous pouvez y ajouter un message :
          il accompagnera alors le mail envoyé à l'invité pour le notifier de ce
          partage.
        </DialogContentText>

        <DialogContentText className="hxr">
          <u>Attention :</u> les utilisateurs invités pourront modifier
          l'ensemble du projet : n'hésitez pas à délimiter votre demande dans le
          message.
        </DialogContentText>

        <TextField
          id="email"
          name="email"
          label="email"
          type="email"
          // multiple
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          fullWidth
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
        <Button onClick={onClose}>Annuler</Button>
        <Button type="submit" color="primary" disabled={loading}>
          Envoyer
        </Button>
      </DialogActions>
    </form>
  );
};

const ManageUsers = ({ project, onClose, open }: Props) => {
  const { updateSharedUsers, loading, error } = useProject(
    project._id.toString(),
  );
  const [projectUsersSelected, setProjectUsersSelected] = useState<User[]>([]);
  const [projectUsers, setProjectUsers] = useState<User[]>([]); // useful to put back a deleted user if deleted by mistake
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    if (project) {
      const projectUsersTemp = project.users
        .filter((user: ProjectUser) => user.role === 'user')
        .map((user: ProjectUser) => user.user);
      setProjectUsers(projectUsersTemp);
      setProjectUsersSelected(projectUsersTemp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.users]);
  if (!project) return null;
  const handleChangeUsers = async (event: any, values: User[]) => {
    event.stopPropagation();
    setProjectUsersSelected(values);
  };
  const handleValidate = async (event: any) => {
    event.stopPropagation();
    const nbUsersDeleted = projectUsers.length - projectUsersSelected.length;
    if (nbUsersDeleted === 0) {
      enqueueSnackbar("Aucun utilisateur n'a été supprimé", {
        variant: 'info',
      });
    } else {
      const usersId = projectUsersSelected.map((user) => user._id);
      await updateSharedUsers({ usersId });
      const message =
        nbUsersDeleted === 1
          ? 'Un utilisateur a bien été supprimé du projet'
          : `${nbUsersDeleted} utilisateurs ont bien été supprimés du projet`;
      enqueueSnackbar(message, {
        variant: 'success',
      });
    }
  };
  return (
    <>
      <DialogContent
        dividers={true}
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {!!error && <Block accent>{`${(error as any)?.message}`}</Block>}
        <DialogContentText className="hxr">
          Vous pouvez supprimer l'accès des utilisateurs auxquels le projet a
          été partagé. Pour ce faire, supprimer les de la liste ci-dessous et
          validez.
        </DialogContentText>
        <Autocomplete
          multiple
          options={projectUsers}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Utilisateurs actuels"
              InputProps={{
                ...params.InputProps,
              }}
            />
          )}
          getOptionLabel={(option) =>
            `${option.firstName} ${option.lastName} <${option.email}>`
          }
          value={projectUsersSelected}
          filterSelectedOptions
          onChange={handleChangeUsers}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleValidate} color="primary" disabled={loading}>
          Valider
        </Button>
      </DialogActions>
    </>
  );
};

export default ShareProject;
