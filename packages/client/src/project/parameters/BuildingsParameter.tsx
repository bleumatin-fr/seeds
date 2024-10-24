import { Building } from '@arviva/core';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../ui/Button';
import { useProject } from '../context/useProject';

const Container = styled.div`
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const getTotalImpact = (
  buildings: Building[] | undefined,
  key: 'totalImpact1' | 'totalImpact2' = 'totalImpact1',
) => {
  if (!buildings || buildings.length === 0) return 0;
  return buildings.reduce((total, building) => total + building[key], 0);
};

const BuildingsParameter = () => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const navigate = useNavigate();
  if (!project) return null;
  return (
    <Container>
      {project.buildings && project.buildings.length > 0 ? (
        <p className="hxr description">
          <b>
            {project.buildings.length} salle
            {project.buildings.length > 1 ? 's' : ''}
          </b>{' '}
          {project.buildings.length > 1 ? 'sont configurées' : 'est configurée'}{' '}
          pour votre projet, pour un impact total de{' '}
          <b>{getTotalImpact(project.buildings) + getTotalImpact(project.buildings, 'totalImpact2')} kgCO2eq</b>.
        </p>
      ) : (
        <p className="hxr description">
          Configurez ici les salles pour votre projet <b>{project.name}</b>
        </p>
      )}
      <Button onClick={() => navigate(`./buildings`)}>
        Configuration des salles
      </Button>
    </Container>
  );
};

export default BuildingsParameter;
