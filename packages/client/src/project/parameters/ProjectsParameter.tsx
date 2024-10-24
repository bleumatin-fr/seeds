import { ProjectInformation } from '@arviva/core';
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

export const getTotalImpact = (projects: ProjectInformation[] | undefined) => {
  if (!projects || projects.length === 0) return 0;
  return projects.reduce((total, project) => total + project.totalImpact, 0);
};

const ProjectsParameter = () => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const navigate = useNavigate();
  if (!project) return null;
  return (
    <Container>
      {project.projects && project.projects.length > 0 ? (
        <p className="hxr description">
          <b>
            {project.projects.length} projet
            {project.projects.length > 1 ? 's' : ''}
          </b>{' '}
          {project.projects.length > 1 ? 'sont configurés' : 'est configuré'} pour votre bâtiment / site, pour un impact total de{' '}
          <b>{getTotalImpact(project.projects)} kgCO2eq</b>.
        </p>
      ) : (
        <p className="hxr description">
          Configurez ici les projets pour votre bâtiment / site <b>{project.name}</b>
        </p>
      )}
      <Button onClick={() => navigate(`./projects`)}>
        Configuration des projets
      </Button>
    </Container>
  );
};

export default ProjectsParameter;
