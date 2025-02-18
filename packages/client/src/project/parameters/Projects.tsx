import { Indicator, ProjectInformation } from '@arviva/core';
import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import IndicatorComponent from '../../results/IndicatorComponent';
import Pie1DComponent from '../../results/Pie1DComponent';
import { ResultSection } from '../../results/ResultsSimple';
import Button from '../../ui/Button';
import { useProject } from '../context/useProject';
import { getTotalImpact } from './ProjectsParameter';

import useConfiguration from '../../useConfiguration';
import bike from '../pdf/images/bike.svg';
import leafs from '../pdf/images/leafs-yellow.svg';
import lights from '../pdf/images/lights.svg';
import marquee from '../pdf/images/marquee.svg';
import person from '../pdf/images/person.svg';

const SuperContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: 100%;
  flex-grow: 1;
  position: relative;

  > * {
    z-index: 1;
  }
`;

const Illustration = styled.img`
  position: absolute;
  filter: grayscale(100%) opacity(0.1);
`;

const Container = styled.div`
  padding: 16px;
  display: flex;
  min-height: 100%;
  flex-grow: 1;
  gap: 16px;
  width: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const PieContainer = styled.div`
  width: 100%;
  height: 200px;
`;

const Disk = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${(props) => props.color};
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

const colors = [
  '#e67373',
  '#e69573',
  '#e6b873',
  '#e6da73',
  '#cfe673',
  '#ace673',
  '#8ae673',
  '#73e67e',
  '#73e6a1',
  '#73e6c3',
  '#73e6e6',
  '#73c3e6',
  '#73a1e6',
  '#737ee6',
  '#8a73e6',
  '#ac73e6',
  '#cf73e6',
  '#e673da',
  '#e673b8',
  '#e67395',
];

const EmptyProjectContainer = styled.div`
  padding: 16px;
  background-color: #fefefe;
  border-radius: 28px;
  align-self: center;
  display: flex;
  max-width: 800px;
  margin-top: 50px;

  > div:first-of-type {
    min-width: 300px;
    padding: 16px;
    display: flex;
    justify-content: center;
  }

  > div:last-of-type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 16px;
    gap: 16px;
  }
`;

const Pill = styled.div`
  padding: 8px 24px;
  border-radius: 16px;
  font-size: small;
  font-weight: bold;
  border: 1px solid black;
  font-size: 10px;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;

  h1 {
    font-size: 28px;
  }

  hr {
    width: 50%;
    max-width: 100px;
    margin: auto;
    border: 0;
    border-top: 2px solid #7bd7ff;
  }
`;

const partialToFull = <T,>(x: Partial<T>): T => {
  return x as T;
};

const NoProjects = ({ children }: { children: React.ReactNode }) => {
  const { configuration } = useConfiguration();

  const projectsMessage = configuration['projects.emptyMessage'];

  return (
    <EmptyProjectContainer>
      <div>
        <img src={lights} alt="" />
      </div>
      <div>
        <Pill>Nouveau</Pill>
        <TextContainer
          dangerouslySetInnerHTML={{
            __html: projectsMessage,
          }}
        ></TextContainer>
        {children}
      </div>
    </EmptyProjectContainer>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState<ProjectInformation[]>([]);
  const [alert, setAlert] = useState<string>('');
  const [openModal, setOpenModal] = useState(false);
  const [currentProject, setCurrentProject] =
    useState<Partial<ProjectInformation> | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const { projectId } = useParams();
  const { project, updateProjects, updateParameterAsync } =
    useProject(projectId);
  const { configuration } = useConfiguration();

  const addProjectsMessage = configuration['projects.addMessage'];

  useEffect(() => {
    if (project) {
      if (project.projects) {
        setProjects(project.projects);
      }
    }
  }, [project]);

  const totalImpact = getTotalImpact(projects);

  const pieData = projects.map((project, index) => ({
    name: project.name,
    value: project.totalImpact,
    fill: colors[index],
  }));

  const handleOpenModal = (building?: ProjectInformation) => {
    setCurrentProject(building || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentProject(null); // Reset current building
    setAlert('');
  };

  const handleSaveBuilding = async () => {
    let newProjects: ProjectInformation[] = [];
    if (currentProject) {
      const { id, impactPerShow, nbShows, name } = currentProject;
      if (!impactPerShow || !nbShows || !name) {
        setAlert("Un des champs requis n'est pas complété");
        return;
      }
      if (id) {
        // Edit
        newProjects = projects.map((b) =>
          b.id === id ? partialToFull(currentProject) : b,
        );
        setProjects(newProjects);
      } else {
        // Create
        const newProject = {
          ...currentProject,
          id: Date.now(), // Simple ID generation
          totalImpact: impactPerShow * nbShows,
          color: colors[projects.length],
        };
        newProjects = [...projects, partialToFull(newProject)];
        setProjects(newProjects);
      }
      await updateProjects(newProjects);
      const totalImpact = getTotalImpact(newProjects);
      updateParameterAsync([
        {
          type: 'id',
          id: 'projects',
          value: totalImpact,
        },
      ]);
      handleCloseModal();
      setAlert('');
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteProjectId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteProjectId(null); // Reset delete building id
  };

  const handleConfirmDelete = async () => {
    if (deleteProjectId !== null) {
      const newProjects = projects.filter((b) => b.id !== deleteProjectId);
      setProjects(newProjects);
      await updateProjects(newProjects);
      handleCloseDeleteDialog();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCurrentProject({ ...currentProject, name: value });
  };

  const handleChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const numberValue = parseFloat(value);
      const newProject: Partial<ProjectInformation> = {
        ...currentProject,
        [fieldName]: numberValue,
      };
      newProject.totalImpact =
        (newProject.impactPerShow || 0) * (newProject.nbShows || 0);
      setCurrentProject(newProject);
    };

  const indicator: Indicator = {
    type: 'indicator',
    code: 'co2',
    title: 'Emissions',
    number: totalImpact.toString(),
    unit: 'kgCO2',
  };

  return (
    <SuperContainer>
      <p className="h2b" style={{ marginLeft: '32px' }}>
        Projets hébergés pour le bâtiment / site {project?.name}
      </p>
      <Illustration
        src={bike}
        alt=""
        height="60px"
        style={{
          top: '10%',
          left: '20%',
        }}
      />
      <Illustration
        src={leafs}
        alt=""
        height="60px"
        style={{
          top: '5%',
          left: '90%',
        }}
      />
      <Illustration
        src={person}
        alt=""
        height="60px"
        style={{
          top: '90%',
          left: '5%',
        }}
      />
      <Illustration
        src={marquee}
        alt=""
        height="60px"
        style={{
          top: '110%',
          left: '80%',
        }}
      />

      {!projects ||
        (projects.length === 0 && (
          <NoProjects>
            <Button
              variant="outlined"
              onClick={() => handleOpenModal()}
              startIcon={<AddIcon />}
              style={{
                backgroundColor: 'var(--yellow)',
              }}
            >
              Ajouter un projet
            </Button>
          </NoProjects>
        ))}
      <Container>
        {projects && projects.length > 0 && (
          <>
            <Box
              flex={3}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap="16px"
              padding="16px"
              borderRadius="8px"
            >
              <HeaderContainer
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  gap: '16px',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleOpenModal()}
                  startIcon={<AddIcon />}
                  style={{
                    backgroundColor: 'var(--yellow)',
                  }}
                >
                  Ajouter un projet
                </Button>
              </HeaderContainer>

              <Table sx={{ backgroundColor: 'white', borderRadius: '8px' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Impact / représentation (kgCO2eq)</TableCell>
                    <TableCell>Nombre de représentations</TableCell>
                    <TableCell>Impact total (kgCO2eq)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => (
                    <TableRow
                      key={project.id}
                      onClick={() => handleOpenModal(project)}
                      hover
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <Disk color={colors[index % colors.length]} />
                          {project.name}
                        </Box>
                      </TableCell>
                      <TableCell>{project.impactPerShow}</TableCell>
                      <TableCell>{project.nbShows}</TableCell>
                      <TableCell>{project.totalImpact}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents row click event
                            handleOpenDeleteDialog(project.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              borderRadius="28px"
              gap="16px"
              sx={{
                backgroundColor: 'var(--green)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  padding: '32px',
                  color: 'white',
                }}
              >
                <p
                  className="h4b"
                  style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  Empreinte des projets hébergés
                </p>
                <ResultSection result={indicator} loading={false}>
                  <IndicatorComponent result={indicator} />
                </ResultSection>
              </div>

              <div
                style={{
                  background: 'white',
                  flexGrow: 1,
                  padding: '32px',
                  borderBottomLeftRadius: '28px',
                  borderBottomRightRadius: '28px',
                }}
              >
                <p
                  className="hxb"
                  style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  Répartition par projet
                </p>
                <PieContainer>
                  <Pie1DComponent
                    result={{ type: 'pie1D', data: pieData, unit: 'kgCO2eq' }}
                  />
                </PieContainer>
              </div>
            </Box>
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Confirmation de suppression</DialogTitle>
              <DialogContent>
                Êtes-vous sûr de vouloir supprimer ce projet ?
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
                <Button onClick={handleConfirmDelete} color="error">
                  Supprimer
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>

      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        PaperProps={{
          sx: {
            borderRadius: '28px',
            width: '100%',
            maxWidth: '720px!important',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <img src={lights} alt="" style={{ maxHeight: '50px' }} />
          {currentProject?.id
            ? `Editer le projet "${currentProject?.name}"`
            : 'Ajouter un projet'}
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
            value={currentProject?.name || ''}
            onChange={handleNameChange}
          />
          <ColumnsContainer style={{ marginTop: 16 }}>
            <LeftColumn
              dangerouslySetInnerHTML={{ __html: addProjectsMessage }}
            ></LeftColumn>

            <RightColumn></RightColumn>
          </ColumnsContainer>

          <ColumnsContainer style={{ marginBottom: 16 }}>
            <LeftColumn style={{ paddingTop: 16 }}>
              <TextField
                required
                margin="dense"
                name="impactPerShow"
                label="Impact / représentation"
                type="number"
                fullWidth
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kgCO2eq</InputAdornment>
                  ),
                }}
                value={currentProject?.impactPerShow || ''}
                onChange={handleChange('impactPerShow')}
              />
            </LeftColumn>

            <RightColumn style={{ paddingTop: 16 }}>
              <TextField
                required
                margin="dense"
                name="nbShows"
                label="Nombre de représentation"
                type="number"
                fullWidth
                variant="outlined"
                value={currentProject?.nbShows || ''}
                onChange={handleChange('nbShows')}
              />
            </RightColumn>
          </ColumnsContainer>
        </DialogContent>
        <DialogActions
          sx={{
            padding: '16px',
          }}
        >
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button
            onClick={handleSaveBuilding}
            style={{
              backgroundColor: 'var(--yellow)',
            }}
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </SuperContainer>
  );
};

export default Projects;
