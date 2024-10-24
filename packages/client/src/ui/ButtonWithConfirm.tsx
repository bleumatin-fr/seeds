import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { MouseEvent, ReactNode, useState } from 'react';
import Button from './Button';

export interface ButtonWithConfirmProps extends ButtonProps {
  modalTitle: ReactNode;
  modalContent: ReactNode;
  onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
  [key: string]: any;
}

const ButtonWithConfirm = ({
  onConfirm,
  children,
  component: Component = Button,
  modalTitle,
  modalContent,
  ...rest
}: ButtonWithConfirmProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleRemoveStep = (event: MouseEvent<HTMLButtonElement>) => {
    handleClose(event);
    onConfirm && onConfirm(event);
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <p
        className="hxr"
        onClick={(event: MouseEvent<HTMLParagraphElement>) => {
          event.stopPropagation();
          event.preventDefault();
          setConfirmDialogOpen(true);
        }}
      >
        {children}
      </p>

      <Dialog open={confirmDialogOpen} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">{modalTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {modalContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Non, conserver</Button>
          <Button onClick={handleRemoveStep} autoFocus color="error">
            Oui, supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ButtonWithConfirm;
