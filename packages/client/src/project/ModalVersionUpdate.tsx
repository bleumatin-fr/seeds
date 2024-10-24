import { Project } from '@arviva/core';
import styled from '@emotion/styled';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import useUser from '../authentication/context/useUser';
import Markdown from '../ui/Markdown';
import useConfiguration from '../useConfiguration';
import { useModelsOfType } from './context/useModels';

const CustomAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
    gap: '8px',
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  lastSeenAt: Date | undefined;
}

const isNew = (lastSeenAt?: Date, publishedAt?: Date) => {
  const seen = lastSeenAt ? new Date(lastSeenAt) : new Date(1900, 0, 0);
  const published = publishedAt ? new Date(publishedAt) : new Date(1901, 0, 0);

  return seen ? published > seen : false;
};

const VersionInformationContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 1rem;
  gap: 3rem;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;

  > div:nth-of-type(2) {
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 1rem;
    background-color: var(--yellow);
  }
`;

const TextExplanationContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 1rem;
  background-color: var(--yellow);
`;

const ModalVersionUpdate = ({ open, onClose, project, lastSeenAt }: Props) => {
  const { models } = useModelsOfType(project.model.type);
  const { user } = useUser();
  const { configuration } = useConfiguration();
  if (!models) return null;
  const sortedModels = models.sort((a, b) => b.versionNumber - a.versionNumber);

  const userProject = project?.users.find(
    (u) => u.id.toString() === user?._id.toString(),
  );
  const seen = lastSeenAt ? new Date(lastSeenAt) : new Date(1900, 0, 0);
  const published = project?.model.publishedAt
    ? new Date(project.model.publishedAt)
    : new Date(1901, 0, 0);
  const autoOpen = !seen || seen < published;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{project.name} vient d'être mis à jour ! </DialogTitle>
      <DialogContent
        dividers={true}
        sx={{ gap: '16px', display: 'flex', flexDirection: 'column' }}
      >
        {autoOpen && configuration['version.autoOpenMessage'] && (
          <TextExplanationContainer
            dangerouslySetInnerHTML={{
              __html: configuration['version.autoOpenMessage'],
            }}
          ></TextExplanationContainer>
        )}
        {!autoOpen && configuration['version.defaultMessage'] && (
          <TextExplanationContainer
            dangerouslySetInnerHTML={{
              __html: configuration['version.defaultMessage'],
            }}
          ></TextExplanationContainer>
        )}
        {sortedModels.map((model) => (
          <Accordion
            key={model._id.toString()}
            defaultExpanded={isNew(userProject?.lastSeenAt, model.publishedAt)}
          >
            <CustomAccordionSummary expandIcon={<ExpandMoreIcon />}>
              {isNew(userProject?.lastSeenAt, model.publishedAt) && (
                <NewReleasesIcon sx={{ color: 'var(--green)' }} />
              )}
              <p className="h5b">Mise à jour {model.versionNumber}</p>
              {model.publishedAt && (
                <p className="hxr">
                  - appliquée le{' '}
                  {new Date(model.publishedAt).toLocaleDateString()}
                </p>
              )}
            </CustomAccordionSummary>
            {(model.changelog || model.userInformation) && (
              <AccordionDetails>
                <VersionInformationContainer>
                  {model.changelog && <Markdown>{model.changelog}</Markdown>}
                  {model.userInformation && (
                    <Markdown>{model.userInformation}</Markdown>
                  )}
                </VersionInformationContainer>
              </AccordionDetails>
            )}
          </Accordion>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
          fullWidth
          startIcon={<CheckCircleOutlineIcon />}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalVersionUpdate;
