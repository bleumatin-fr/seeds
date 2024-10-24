import { Report } from '@arviva/core';
import styled from '@emotion/styled';
import React, { MouseEvent, MouseEventHandler } from 'react';

import ButtonWithConfirm from '../ui/ButtonWithConfirm';

import SettingsIcon from '@mui/icons-material/MoreHorizOutlined';
import IconButton from '@mui/material/IconButton';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Tooltip } from '@mui/material';
import BaseBlock from '../ui/Block';
import ProjectIllustration from '../project/ProjectIllustration';

interface ReportCardProps {
  report: Report;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
  onDelete?: (event: any) => Promise<Partial<Report>>;
}

const Block = styled(BaseBlock)`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid white;
  height: unset;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  position: relative;
  height: 150px;
  min-width: 185px;
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
    border: 1px solid black;
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

const ProjectCountContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`;

const ReportCard = ({ report, onClick, onDelete }: ReportCardProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const countProjectsByType = report.projects.reduce((acc, project) => {
    return {
      ...acc,
      [project.model.name]: (acc[project.model.name] || 0) + 1,
    };
  }, {} as { [key: string]: number });

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
    onDelete && (await onDelete(event));
  };

  return (
    <Block onClick={onClick}>
      <IconButton
        sx={{ position: 'absolute', top: '6px', right: '6px', padding: 0 }}
        onClick={handleOpenMenu}
      >
      <Tooltip title="Options">
        <SettingsIcon />
      </Tooltip>
      </IconButton>
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
        <MenuItem onClick={(e)=>e.stopPropagation()}>
          <ButtonWithConfirm
            onConfirm={handleDelete}
            modalTitle={`Suppression du rapport`}
            modalContent={
              <>
                Vous êtes sur le point de supprimer le rapport {report.name} !<br />
                <br />
                Êtes-vous sûr ?
              </>
            }
          >
            Supprimer
          </ButtonWithConfirm>
        </MenuItem>
      </Menu>
      <ProjectIllustration type="report" />
      <div />
      <TitleContainer>
        <p className="h6r" style={{ marginBottom: '10px' }}>
          {report.name}
        </p>
      </TitleContainer>
      <div>
        <p className="hzr">
          Crée le {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div>
        {Object.keys(countProjectsByType).map((type) => (
          <ProjectCountContainer key={type}>
            <p className="hzb">{countProjectsByType[type]}</p>
            <p className="hzr">{type}</p>
          </ProjectCountContainer>
        ))}
      </div>
    </Block>
  );
};

export default ReportCard;
