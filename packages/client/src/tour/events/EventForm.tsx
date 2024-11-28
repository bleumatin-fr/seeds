import DateFnsAdapter from '@date-io/date-fns';
import {
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { ChangeEvent, MouseEvent, SyntheticEvent } from 'react';

import Delete from '../../ui/icons/delete.svg?react';
import Help from '../../ui/icons/help.svg?react';
import { TourEvent } from '../context/types';
import useStep from '../context/useStep';
import useTour from '../context/useTour';
import useEvent from './useEvent';

const dateFns = new DateFnsAdapter();

const EventForm = ({
  event,
  expanded,
  onExpandedChange,
}: {
  event: TourEvent;
  expanded: string | false;
  onExpandedChange: (event: SyntheticEvent, isExpanded: boolean) => void;
}) => {
  const { removeEvent, updateEvent } = useTour();
  const { stepId } = useStep();
  const { eventId } = useEvent();

  const handleRemoved = (event: MouseEvent<HTMLButtonElement>) => {
    removeEvent(stepId, eventId);
  };

  const handleDateChanged = (event: ChangeEvent<HTMLInputElement>) => {
    updateEvent(stepId, eventId, {
      date: new Date(event.target.value),
    });
  };

  const handleNameChanged = (event: ChangeEvent<HTMLInputElement>) => {
    updateEvent(stepId, eventId, {
      name: event.target.value,
    });
  };

  const handleNbOfSeatsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    updateEvent(stepId, eventId, {
      numberOfSeats: event.target.value,
    });
  };

  return (
    <FormControl
      variant="outlined"
      fullWidth
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
      }}
    >
      <TextField
        type="date"
        defaultValue={
          event.date ? dateFns.toISO(new Date(event.date)).substring(0, 10) : ''
        }
        onChange={handleDateChanged}
        label={'Date'}
        size="small"
        sx={{
          input: {
            fontSize: '13px',
          },
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        type="text"
        value={event.name || ''}
        onChange={handleNameChanged}
        label={'Nom structure'}
        size="small"
        sx={{
          input: {
            fontSize: '13px',
          },
        }}
      />
      <TextField
        type="number"
        defaultValue={event.numberOfSeats || ''}
        onChange={handleNbOfSeatsChanged}
        label={'Nombre de places'}
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" style={{ cursor: 'help' }}>
              <Tooltip
                title={
                  <>
                    <p>
                      La jauge de la salle est une information dont notre modèle
                      de calcul ne se sert pas encore.
                    </p>
                    <p>
                      Dans une prochaine version de SEEDS, nous allons utiliser
                      cette information pour estimer la consommation de CO2
                      d'une salle.
                    </p>
                  </>
                }
              >
                <Help />
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{
          input: {
            fontSize: '13px',
          },
        }}
      />
      <IconButton onClick={handleRemoved}>
        <Delete />
      </IconButton>
    </FormControl>
  );
};

export default EventForm;
