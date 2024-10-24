import styled from '@emotion/styled';
import React from 'react';

import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import { ReactComponent as OperationsIcon } from '../ui/icons/categories/accueil public.svg';
import { ReactComponent as BuildingIcon } from '../ui/icons/categories/batiment.svg';
import { ReactComponent as ProjectIcon } from '../ui/icons/categories/production.svg';

export const ProjectTypesIcons: { [key: string]: React.ReactNode } = {
  project: <ProjectIcon />,
  building: <BuildingIcon />,
  operation: <OperationsIcon />,
  report: <LibraryBooksOutlinedIcon />,
};

const ProjectIllustrationContainer = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;

const ProjectText = styled.div`
  fill: #000000;
  width: 32px;
`;

const ProjectIllustration = ({ type }: { type: string }) => {
  return (
    <ProjectIllustrationContainer>
      <ProjectText>{ProjectTypesIcons[type]}</ProjectText>
    </ProjectIllustrationContainer>
  );
};

export default ProjectIllustration;
