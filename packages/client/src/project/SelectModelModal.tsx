import { Model } from '@arviva/core';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';

import styled from '@emotion/styled';
import { ReactComponent as OperationsIcon } from '../ui/icons/categories/accueil public.svg';
import { ReactComponent as BuildingIcon } from '../ui/icons/categories/batiment.svg';
import { ReactComponent as ProjectIcon } from '../ui/icons/categories/production.svg';

interface SelectModelModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNext: () => void;
  models: Model[] | undefined;
  setModelSelected: (model: Model) => void;
}

const ProjectTypesIcons: { [key: string]: React.ReactNode } = {
  project: <ProjectIcon />,
  building: <BuildingIcon />,
  operation: <OperationsIcon />,
};

const ProjectTypesContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const ProjectTypeButton = styled(Button)`
  flex-direction: column;
  min-width: 120px;
  flex: 1;
  padding: 5px 25px;
  svg {
    width: 80px;
    height: 80px;
  }

  > span {
    margin: 0;
  }
`;

const SelectModelModal = ({
  open,
  setOpen,
  onNext,
  models,
  setModelSelected,
}: SelectModelModalProps) => {
  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = (projectSelected: Model) => () => {
    if (!projectSelected) {
      throw new Error('Project model not found');
    }
    setModelSelected(projectSelected);
    setOpen(false);
    onNext();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle id="scroll-dialog-title">Sélection type projet</DialogTitle>
      <DialogContent dividers={true}>
        <DialogContentText
          sx={{
            fontWeight: '400',
            fontSize: '16px',
            fontFamily: "'Montserrat', sans-serif",
            margin: '16px 0 32px',
          }}
        >
          Choisissez votre type de Projet
        </DialogContentText>
        {models && (
          <ProjectTypesContainer>
            {models.map((model) => (
              <ProjectTypeButton
                key={model._id.toString()}
                value={model.type}
                startIcon={ProjectTypesIcons[model.type]}
                variant="outlined"
                onClick={handleSave(model)}
              >
                {model.singularName}
              </ProjectTypeButton>
            ))}
          </ProjectTypesContainer>
        )}
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default SelectModelModal;
