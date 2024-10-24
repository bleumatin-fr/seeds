import { FilledInput, FilledInputProps } from '@mui/material';
import { ReactNode } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';

import ButtonWithConfirm from '../ui/ButtonWithConfirm';

export interface InputWithRemoveButtonWithConfirmProps
  extends FilledInputProps {
  onRemoveClicked: () => void;
  modalTitle: ReactNode;
  modalContent: ReactNode;
}

const InputWithRemoveButtonWithConfirm = ({
  onRemoveClicked,
  modalTitle,
  modalContent,
  ...rest
}: InputWithRemoveButtonWithConfirmProps) => (
  <FilledInput
    {...rest}
    sx={{
      button: {
        opacity: 0,
        transition: 'opacity 0.5s ease-in-out',
      },
      '&:hover': {
        button: {
          opacity: 1,
        },
      },
      ...rest.sx,
    }}
    endAdornment={
      <ButtonWithConfirm
        startIcon={<DeleteIcon />}
        disableElevation
        disabled={rest.disabled}
        size="small"
        color="error"
        onConfirm={onRemoveClicked}
        sx={{ padding: 0.5, paddingLeft: 3, paddingRight: 3 }}
        modalTitle={modalTitle}
        modalContent={modalContent}
      >
        Supprimer
      </ButtonWithConfirm>
    }
  />
);

export default InputWithRemoveButtonWithConfirm;
