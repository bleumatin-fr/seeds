import { Project, ProjectUser } from '@arviva/core';
import styled from '@emotion/styled';
import React, { MouseEvent, MouseEventHandler } from 'react';

import ShareProject from './ShareProject';

import ButtonWithConfirm from '../ui/ButtonWithConfirm';

import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import IconButton from '@mui/material/IconButton';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import useUser from '../authentication/context/useUser';

import CompletionBar from './CompletionBar';

import BaseBlock from '../ui/Block';

import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import ProjectIllustration from './ProjectIllustration';

interface ProjectCardProps {
  project: Project;
  onClick: MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
  onDelete: (event: any) => Promise<Partial<Project>>;
  onDuplicate: (event: any) => Promise<Partial<Project>>;
}

const Block = styled(BaseBlock)`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  height: unset;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  position: relative;
  .hzr {
    font-size: 10px;
  }
  svg {
    transition: fill 0.2s ease-in-out;
  }
  > div:last-of-type {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    > div {
      flex: 1;
    }
  }
  &:hover {
    border: 2px solid var(--green);
    .h6r {
      font-weight: bold;
    }
  }
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  text-align: center;
`;

const ProjectCard = ({
  project,
  onClick,
  onDelete,
  onDuplicate,
}: ProjectCardProps) => {
  const { user } = useUser();
  const [openShare, setOpenShare] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [duplicateLoading, setDuplicateLoading] =
    React.useState<boolean>(false);

  const isShareProject = project.users.some(
    (u: ProjectUser) => u.id === user?._id && u.role === 'owner',
  );

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
  };

  const handleDelete = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await onDelete(event);
  };

  const handleShare = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setOpenShare(true);
  };

  const handleDuplicate = async (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setDuplicateLoading(true);
    const duplicatedProject = await onDuplicate(event);
    if (duplicatedProject) {
      setDuplicateLoading(false);
      enqueueSnackbar('Projet dupliqué', { variant: 'success' });
      navigate(`/project/${duplicatedProject._id}`);
    }
  };

  return (
    <Block onClick={onClick}>
      <ShareProject
        open={openShare}
        onClose={() => setOpenShare(false)}
        project={project}
      />
      <IconButton
        sx={{ position: 'absolute', top: '6px', right: '6px', padding: 0 }}
        onClick={handleOpenMenu}
      >
        <MoreHorizOutlinedIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        onClick={(event: MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <MenuItem>
          <ButtonWithConfirm
            onConfirm={handleDelete}
            modalTitle={`Suppression du projet`}
            modalContent={
              <>
                Vous êtes sur le point de supprimer le projet ainsi que toutes
                ses informations.
                <br />
                Voulez-vous vraiment supprimer ce projet ?
              </>
            }
          >
            Supprimer
          </ButtonWithConfirm>
        </MenuItem>
        {isShareProject && (
          <MenuItem onClick={handleShare}>
            <p className="hxr">Partager</p>
          </MenuItem>
        )}
        <MenuItem onClick={handleDuplicate} disabled={duplicateLoading}>
          <p className="hxr">Dupliquer</p>
          <CircularProgress
            size="small"
            variant="indeterminate"
            sx={{
              visibility: duplicateLoading ? 'visible' : 'hidden',
              width: '20px !important',
              height: '20px !important',
              marginLeft: '10px !important',
            }}
          />
        </MenuItem>
      </Menu>
      <ProjectIllustration type={project.model.type} />
      <TitleContainer>
        <p className="h6r" style={{ marginBottom: '10px' }}>
          {project.name}
        </p>
      </TitleContainer>
      <div>
        <div>
          <CompletionBar completion={project.completionRate} />
        </div>
        <p className="hzb">{project.completionRate}%</p>
      </div>
    </Block>
  );
};

export default ProjectCard;
