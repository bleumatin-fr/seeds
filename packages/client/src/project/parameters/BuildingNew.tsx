import { Building } from '@arviva/core';
import styled from '@emotion/styled';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import Button from '../../ui/Button';
import useConfiguration from '../../useConfiguration';
import marquee from '../pdf/images/marquee.svg';
import BuildingImpact from './BuildingImpact';

const TwoFieldsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const ColumnsContainer = styled.div`
  display: flex;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 50%;
  border-right: 1px solid #000;
  padding-right: 16px;
  font-size: 14px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 50%;
  padding-left: 16px;
`;

const BuildingNew = ({
  open,
  onClose,
  onSave,
  currentBuilding,
  setCurrentBuilding,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  currentBuilding: Partial<Building> | null;
  setCurrentBuilding: (building: Partial<Building> | null) => void;
}) => {
  const [alert, setAlert] = useState<string>('');
  const [openBuildingImpact, setOpenBuildingImpact] = useState<boolean>(false);
  const { configuration } = useConfiguration();

  const addBuildingsMessage = configuration['buildings.addMessage'];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCurrentBuilding({ ...currentBuilding, name: value });
  };

  const handleChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const numberValue = parseFloat(value);
      const newBuilding: Partial<Building> = {
        ...currentBuilding,
        [fieldName]: numberValue,
      };
      newBuilding.totalImpact1 =
        (newBuilding.impactPerDay || 0) * (newBuilding.nbDays || 0);
      newBuilding.totalImpact2 =
        (newBuilding.impactPerSpectator || 0) * (newBuilding.nbSpectators || 0);
      setCurrentBuilding(newBuilding);
    };

  const handleUpdateImpact = (
    impactPerDay: number,
    impactPerSpectator: number,
  ) => {
    const newBuilding: Partial<Building> = {
      ...currentBuilding,
      impactPerDay,
      impactPerSpectator,
    };
    newBuilding.totalImpact1 =
      (newBuilding.impactPerDay || 0) * (newBuilding.nbDays || 0);
    newBuilding.totalImpact2 =
      (newBuilding.impactPerSpectator || 0) * (newBuilding.nbSpectators || 0);
    setCurrentBuilding(newBuilding);
  };

  const handleValidate = () => {
    if (currentBuilding) {
      const {
        impactPerDay,
        nbDays,
        impactPerSpectator,
        nbSpectators,
        name,
      } = currentBuilding;
      if (
        !impactPerDay ||
        !nbDays ||
        !name ||
        !impactPerSpectator ||
        !nbSpectators
      ) {
        setAlert("Un des champs requis n'est pas complété");
        return;
      } else {
        setAlert('');
        onSave();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '28px',
          width: '100%',
          maxWidth: '720px!important',
        },
      }}
    >
      {openBuildingImpact && (
        <BuildingImpact
          open={openBuildingImpact}
          onClose={() => setOpenBuildingImpact(false)}
          handleUpdateImpact={handleUpdateImpact}
        />
      )}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <img src={marquee} alt="" style={{ maxHeight: '50px' }} />
        {currentBuilding?.id
          ? `Editer la salle "${currentBuilding?.name}"`
          : 'Ajouter une salle'}
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '50px',
        }}
      >
        {alert.length > 0 && <Alert severity="warning">{alert}</Alert>}
        <TextField
          autoFocus
          required
          margin="dense"
          name="name"
          label="Nom"
          type="text"
          fullWidth
          variant="outlined"
          value={currentBuilding?.name || ''}
          onChange={handleNameChange}
        />
        <ColumnsContainer style={{ marginTop: 16 }}>
          <LeftColumn
            dangerouslySetInnerHTML={{ __html: addBuildingsMessage }}
          ></LeftColumn>

          <RightColumn></RightColumn>
        </ColumnsContainer>
        <ColumnsContainer style={{ marginBottom: 16 }}>
          <LeftColumn style={{ paddingTop: 16 }}>
            <TextField
              required
              margin="dense"
              name="impactPerDay"
              label="Impact / jour"
              type="number"
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kgCO2eq</InputAdornment>
                ),
              }}
              value={currentBuilding?.impactPerDay || ''}
              onChange={handleChange('impactPerDay')}
            />
            <TextField
              required
              margin="dense"
              name="impactPerSpectator"
              label="Impact / spectateur"
              type="number"
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">kgCO2eq</InputAdornment>
                ),
              }}
              value={currentBuilding?.impactPerSpectator || ''}
              onChange={handleChange('impactPerSpectator')}
            />
          </LeftColumn>

          <RightColumn style={{ paddingTop: 16 }}>
            <TextField
              required
              margin="dense"
              name="nbDays"
              label="Nombre de jours"
              type="number"
              fullWidth
              variant="outlined"
              value={currentBuilding?.nbDays || ''}
              onChange={handleChange('nbDays')}
            />
            <TextField
              required
              margin="dense"
              name="nbSpectators"
              label="Nombre de spectateurs"
              type="number"
              fullWidth
              variant="outlined"
              value={currentBuilding?.nbSpectators || ''}
              onChange={handleChange('nbSpectators')}
            />
          </RightColumn>
        </ColumnsContainer>

        <TwoFieldsContainer>
          <Button onClick={() => setOpenBuildingImpact(true)}>
            Je ne connais pas l'impact
          </Button>
        </TwoFieldsContainer>
      </DialogContent>
      <DialogActions
        sx={{
          padding: '16px',
        }}
      >
        <Button onClick={onClose}>Annuler</Button>
        <Button
          onClick={handleValidate}
          style={{
            backgroundColor: 'var(--yellow)',
          }}
        >
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuildingNew;
