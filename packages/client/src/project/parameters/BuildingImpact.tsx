import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormLabel,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React, { useState } from 'react';
import Button from '../../ui/Button';
import useConfiguration from '../../useConfiguration';

type Gauge = '0-500' | '500-1000' | '1000+';
type Location = 'rural' | 'périurbain' | 'urbain';
type AbacusOfImpacts = {
  [key in Gauge]: {
    [key in Location]: number;
  };
};

const BuildingImpact = ({
  open,
  onClose,
  handleUpdateImpact,
}: {
  open: boolean;
  onClose: () => void;
  handleUpdateImpact: (
    impactPerDay: number,
    impactPerSpectator: number,
  ) => void;
}) => {
  const [location, setLocation] = useState<Location | ''>('');
  const [gauge, setGauge] = useState<Gauge | ''>('');
  const { configuration } = useConfiguration();

  const abacusPerDay: AbacusOfImpacts = JSON.parse(configuration['impact.day']);
  const abacusPerSpectator: AbacusOfImpacts = JSON.parse(
    configuration['impact.spectator'],
  );

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(event.target.value as Location);
  };

  const handleGaugeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGauge(event.target.value as Gauge);
  };

  const validateSelection = () => {
    if (gauge !== '' && location !== '') {
      const impactPerDay = abacusPerDay[gauge][location];
      const impactPerSpectator = abacusPerSpectator[gauge][location];
      handleUpdateImpact(impactPerDay, impactPerSpectator);
      onClose();
    }
  };

  const isValid = location && gauge;

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
      <DialogTitle>Estimation de l'impact de la salle</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: 700,
        }}
      >
        <DialogContentText>
          Sélectionner la localisation et la jauge de la salle pour estimer
          l'impact par jour et l'impact par spectateur
        </DialogContentText>
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel>Localisation</FormLabel>
          <RadioGroup
            aria-label="location"
            name="location"
            value={location}
            onChange={handleLocationChange}
          >
            <FormControlLabel value="rural" control={<Radio />} label="Rural" />
            <FormControlLabel
              value="périurbain"
              control={<Radio />}
              label="Périurbain"
            />
            <FormControlLabel
              value="urbain"
              control={<Radio />}
              label="Urbain"
            />
          </RadioGroup>
        </FormControl>
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <RadioGroup
            aria-label="gauge"
            name="gauge"
            value={gauge}
            onChange={handleGaugeChange}
          >
            <FormLabel>Jauge</FormLabel>
            <FormControlLabel value="0-500" control={<Radio />} label="0-500" />
            <FormControlLabel
              value="500-1000"
              control={<Radio />}
              label="500-1000"
            />
            <FormControlLabel
              value="1000+"
              control={<Radio />}
              label="1000 et plus"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button sx={{ mt: 2 }} onClick={onClose}>
          Annuler
        </Button>
        <Button
          sx={{ mt: 2 }}
          onClick={validateSelection}
          disabled={!isValid}
          style={{ backgroundColor: 'var(--yellow)' }}
        >
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuildingImpact;
