import styled from '@emotion/styled';
import {
  Dialog,
  DialogContent,
  DialogContentText as BaseDialogContentText,
} from '@mui/material';
import Button from '../ui/Button';
import { ReactComponent as CloseIcon } from '../ui/icons/close.svg';
import { ReactComponent as BaseIllustration } from './images/fireworks.svg';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

const DialogContentText = styled(BaseDialogContentText)`
  font-size: 16px;
  font-weight: 400;
  font-family: 'Montserrat', sans-serif;
  margin: 16px 0 32px;
  overflow: hidden;

  h3 {
    text-align: center;
    margin: 32px 0 0 0;
  }
  h4 {
    text-align: center;
    margin: 0 0 32px;
    color: var(--grey);
  }

  p {
    margin: 16px 0;
    text-align: center;

    li {
      margin-left: 24px;
    }
  }

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin: 32px 0;
  }
`;

const Illustration = styled(BaseIllustration)`
  width: 350px;
  margin: auto;
  display: block;
`;

const SuccessModal = ({ open, onClose }: SuccessModalProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent dividers={true}>
        <DialogContentText>
          <Illustration />
          <h3>Tutoriel complété</h3>
          <h4>Vous êtes au top</h4>
          <p>
            Vous avez terminé le tutoriel et vous êtes prêts à utiliser SEEDS !
          </p>
          <p>
            Tout n'est pas fini, si vous avez la moindre question ou suggestion
            concernant SEEDS, n'hésitez pas à nous contacter à l'aide du bouton
            jaune en bas à droite de l'écran.
          </p>
          <div>
            <Button onClick={onClose} color="primary" startIcon={<CloseIcon />}>
              Fermer le tutoriel
            </Button>
          </div>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
