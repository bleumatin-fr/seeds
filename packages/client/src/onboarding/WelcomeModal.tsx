import styled from '@emotion/styled';
import {
  Dialog,
  DialogContent,
  DialogContentText as BaseDialogContentText,
  Link,
} from '@mui/material';
import Button from '../ui/Button';
import SkipIcon from '../ui/icons/skip.svg?react';
import BaseIllustration from './images/dig-holes.svg?react';

interface WelcomeModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DialogContentText = styled(BaseDialogContentText)`
  font-size: 16px;
  font-weight: 400;
  font-family: 'Montserrat', sans-serif;
  margin: 16px 0 32px;

  h3 {
    text-align: center;
    margin: 32px 0;
  }
  h4 {
    text-align: center;
    margin: 0 0 32px;
    color: var(--grey);
  }

  p {
    margin: 16px 0;

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

const WelcomeModal = ({ open, onConfirm, onCancel }: WelcomeModalProps) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogContent dividers={true}>
        <DialogContentText>
          <Illustration />
          <h3>Bienvenue sur SEEDS</h3>
          <p>
            Nous vous invitons dès à présent à suivre notre tutoriel
            d'utilisation. Il vous permettra de comprendre les fonctionnalités
            de SEEDS et d'initialiser votre démarche.
          </p>
          <p>
            Après avoir complété vos données dans l'outil vous aurez:
            <ul>
              <li>Un ordre de grandeur de votre empreinte environnementale</li>
              <li>Quelques actions à mener pour réduire votre empreinte</li>
              <li>Une idée de ce qu'il vous reste à faire</li>
            </ul>
          </p>
          <div>
            <Button
              onClick={onConfirm}
              color="primary"
              startIcon={<SkipIcon />}
            >
              Suivre le tutoriel
            </Button>
            <Link
              href="/"
              onClick={(event) => {
                event.preventDefault();
                onCancel();
              }}
            >
              Je connais déjà, passer
            </Link>
          </div>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
