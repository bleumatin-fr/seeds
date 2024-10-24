import { InputAdornment, OutlinedInputProps } from '@mui/material';

import EventIcon from '@mui/icons-material/Event';

import InputWithRemoveButtonWithConfirm from '../InputWithRemoveButtonWithConfirm';

interface PlaceInputProps extends OutlinedInputProps {
  onRemove: () => void;
}

const PlaceInput = ({ onRemove, ...rest }: PlaceInputProps) => {
  return (
    <InputWithRemoveButtonWithConfirm
      type="text"
      size="small"
      fullWidth
      startAdornment={
        <InputAdornment position="start">
          <EventIcon />
        </InputAdornment>
      }
      onRemoveClicked={onRemove}
      modalTitle={`Suppression de l'évènement ${rest.defaultValue}`}
      modalContent={
        <>
          Vous êtes sur le point de supprimer l'évènement {rest.defaultValue}{' '}
          ainsi que ses informations.
          <br />
          Voulez-vous vraiment supprimer cet évènement ?
        </>
      }
      {...rest}
    />
  );
};

export default PlaceInput;
