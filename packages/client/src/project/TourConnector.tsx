import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { Tour } from '../tour/context/types';
import { Provider as TourProvider } from '../tour/context/useTour';
import { useProject } from './context/useProject';

import TourComponent from '../tour/TourComponent';
import OriginalBlock from '../ui/Block';
import Button from '../ui/Button';

import styled from '@emotion/styled';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useCallbackPrompt } from '../tour/useCallbackPrompt';
import LoadingButton from '../ui/LoadingButton';
import getParametersFromTour from './getParametersFromTour';

export const ConnectedTour = () => {
  const location = useLocation();
  const tourOnboardingStarted = useRef(false);
  const { projectId } = useParams();
  const { project, updateTour, updateParameterAsync } = useProject(projectId);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { showPrompt, confirmNavigation, cancelNavigation } =
    useCallbackPrompt(showDialog);

  if (!project) {
    return null;
  }

  const handleOnTourChanged = (tour: Tour) => {
    if (JSON.stringify(project.tour) !== JSON.stringify(tour)) {
      updateTour(tour);
      setShowDialog(true);
    }
  };

  const handleOnTourValidated = async (tour: Tour) => {
    setShowDialog(false);
    const parameters = getParametersFromTour(tour);
    await updateParameterAsync(
      Object.keys(parameters).map((key) => ({
        type: 'id',
        id: key,
        value: parameters[key],
      })),
    );

    navigate(`/project/${projectId}`, {
      state: { scrollTo: (location.state as any)?.scrollBackTo },
    });
  };

  const handleOnDialogClosed = () => {
    cancelNavigation();
  };

  const handleOnConfirmClicked = async () => {
    setLoading(true);
    await handleOnTourValidated(project.tour);
    setLoading(false);
  };

  const handleOnCancelClicked = () => {
    tourOnboardingStarted.current = false;
    confirmNavigation();
  };

  return (
    <TourProvider value={project.tour} onChange={handleOnTourChanged}>
      <Dialog open={showPrompt} onClose={handleOnDialogClosed}>
        <DialogTitle>Validation des changements</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Vous vous appretez à sortir du module mobilité sans valider vos
            changements. Être-vous sûrs ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnDialogClosed} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleOnCancelClicked}
            autoFocus
            color="error"
            disabled={loading}
          >
            Sortir sans valider
          </Button>
          <LoadingButton
            loading={loading}
            onClick={handleOnConfirmClicked}
            variant="contained"
            color="primary"
          >
            Valider et sortir
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <TourComponent onValidate={handleOnTourValidated} />
    </TourProvider>
  );
};

const Block = styled(OriginalBlock)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;

  p {
    margin: 8px 0;
  }
  .title {
    font-weight: 600;
  }
  .left svg {
    width: 90px;
    height: 90px;
  }
`;

const TourConnector = ({ sectorId }: { sectorId: string }) => {
  const navigate = useNavigate();
  const handleClicked = () =>
    navigate('./tour', { state: { scrollBackTo: `#${sectorId}` } });

  return (
    <Block accent>
      <div className="left">
        <LocalShippingOutlinedIcon />
      </div>
      <div className="right">
        <p className="hxr">
          Utilisez le calculateur mobilité pour renseigner les champs en
          personne.km et t.km ci-dessous.
        </p>
        <Button
          startIcon={<LocalShippingOutlinedIcon />}
          onClick={handleClicked}
        >
          Calculateur mobilité
        </Button>
      </div>
    </Block>
  );
};

export default TourConnector;
