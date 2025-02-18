import { Building, Indicator } from '@arviva/core';
import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import IndicatorComponent from '../../results/IndicatorComponent';
import Pie1DComponent from '../../results/Pie1DComponent';
import { ResultSection } from '../../results/ResultsSimple';
import Button from '../../ui/Button';
import useConfiguration from '../../useConfiguration';
import { useProject } from '../context/useProject';
import BuildingNew from './BuildingNew';
import { getTotalImpact } from './BuildingsParameter';

import bike from '../pdf/images/bike.svg';
import leafs from '../pdf/images/leafs-yellow.svg';
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

const Illustration = styled.img`
  position: absolute;
  filter: grayscale(100%) opacity(0.1);
`;

const EmptyBuildingContainer = styled.div`
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

const NoBuildings = ({ children }: { children: React.ReactNode }) => {
  const { configuration } = useConfiguration();

  const buildingsMessage = configuration['buildings.emptyMessage'];

  return (
    <EmptyBuildingContainer>
      <div>
        <img src={marquee} alt="" />
      </div>
      <div>
        <Pill>Nouveau</Pill>
        <TextContainer
          dangerouslySetInnerHTML={{
            __html: buildingsMessage,
          }}
        ></TextContainer>
        {children}
      </div>
    </EmptyBuildingContainer>
  );
};

const Buildings = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [currentBuilding, setCurrentBuilding] =
    useState<Partial<Building> | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteBuildingId, setDeleteBuildingId] = useState<number | null>(null);
  const { projectId } = useParams();
  const { project, updateBuildings, updateParameterAsync } =
    useProject(projectId);

  useEffect(() => {
    if (project) {
      if (project.buildings) {
        setBuildings(project.buildings);
      }
    }
  }, [project]);

  const totalImpact =
    getTotalImpact(buildings) + getTotalImpact(buildings, 'totalImpact2');

  const pieData = buildings.map((building, index) => ({
    name: building.name,
    value: building.totalImpact1 + building.totalImpact2,
    fill: colors[index],
  }));

  const handleOpenModal = (building?: Building) => {
    setCurrentBuilding(building || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentBuilding(null); // Reset current building
  };

  const handleSaveBuilding = async () => {
    let newBuildings: Building[] = [];
    if (!currentBuilding) return;
    const { id, impactPerDay, nbDays, impactPerSpectator, nbSpectators, name } =
      currentBuilding;
    if (
      !impactPerDay ||
      !nbDays ||
      !name ||
      !impactPerSpectator ||
      !nbSpectators
    ) {
      return;
    }
    if (id) {
      // Edit
      newBuildings = buildings.map((b) =>
        b.id === id ? partialToFull(currentBuilding) : b,
      );
      setBuildings(newBuildings);
    } else {
      // Create
      const newBuilding = {
        ...currentBuilding,
        id: Date.now(), // Simple ID generation
        totalImpact1: impactPerDay * nbDays,
        totalImpact2: impactPerSpectator * nbSpectators,
        color: colors[buildings.length],
      };
      newBuildings = [...buildings, partialToFull(newBuilding)];
      setBuildings(newBuildings);
    }
    await updateBuildings(newBuildings);
    const totalImpact = `${getTotalImpact(newBuildings)}|||${getTotalImpact(
      newBuildings,
      'totalImpact2',
    )}`;
    updateParameterAsync([
      {
        type: 'id',
        id: 'buildings',
        value: totalImpact,
      },
    ]);
    handleCloseModal();
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteBuildingId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteBuildingId(null); // Reset delete building id
  };

  const handleConfirmDelete = async () => {
    if (deleteBuildingId !== null) {
      const newBuildings = buildings.filter((b) => b.id !== deleteBuildingId);
      setBuildings(newBuildings);
      await updateBuildings(newBuildings);
      handleCloseDeleteDialog();
  }
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
        Mes salles pour le projet {project?.name}
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
      {!buildings ||
        (buildings.length === 0 && (
          <NoBuildings>
            <Button
              variant="outlined"
              onClick={() => handleOpenModal()}
              startIcon={<AddIcon />}
              style={{
                backgroundColor: 'var(--yellow)',
              }}
            >
              Ajouter une salle
            </Button>
          </NoBuildings>
        ))}
      <Container>
        {buildings && buildings.length > 0 && (
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
                  Ajouter une salle
                </Button>
              </HeaderContainer>

              <Table sx={{ backgroundColor: 'white', borderRadius: '8px' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Impact / jour (kgCO2eq)</TableCell>
                    <TableCell>Nombre de jours</TableCell>
                    <TableCell>Impact / spectateur (kgCO2eq)</TableCell>
                    <TableCell>Nombre de spectateurs</TableCell>
                    <TableCell>Impact lié à l'énergie (kgCO2eq)</TableCell>
                    <TableCell>
                      Impact lié à l'accueil du public (kgCO2eq)
                    </TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buildings.map((building, index) => (
                    <TableRow
                      key={building.id}
                      onClick={() => handleOpenModal(building)}
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
                          {building.name}
                        </Box>
                      </TableCell>
                      <TableCell>{building.impactPerDay}</TableCell>
                      <TableCell>{building.nbDays}</TableCell>
                      <TableCell>{building.impactPerSpectator}</TableCell>
                      <TableCell>{building.nbSpectators}</TableCell>
                      <TableCell>{building.totalImpact1}</TableCell>
                      <TableCell>{building.totalImpact2}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // Prevents row click event
                            handleOpenDeleteDialog(building.id);
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
                  Empreinte des salles
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
                  className="h4b"
                  style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  Répartition par salle
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
                Êtes-vous sûr de vouloir supprimer cette salle ?
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

        <BuildingNew
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveBuilding}
          currentBuilding={currentBuilding}
          setCurrentBuilding={setCurrentBuilding}
        />
      </Container>
    </SuperContainer>
  );
};

export default Buildings;
