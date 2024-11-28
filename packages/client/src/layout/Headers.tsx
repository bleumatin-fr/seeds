import styled from '@emotion/styled';
import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import useUser from '../authentication/context/useUser';
import { getProjectTitle, useProject } from '../project/context/useProject';

import DownloadForOfflineOutlinedIcon from '@mui/icons-material/DownloadForOfflineOutlined';
import Export from '../ui/icons/export.svg?react';
import Home from '../ui/icons/home.svg?react';
import Next from '../ui/icons/next.svg?react';

import ShareProject from '../project/ShareProject';

import { Project, ProjectUser, Report } from '@arviva/core';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { CircularProgress } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { authenticatedFetch } from '../authentication/authenticatedFetch';
import keyify from '../project/keyify';
import useReport from '../reports/context/useReport';
import UserMenu from './UserMenu';

export const HeaderContainer = styled.header`
  height: 64px;
  width: 100%;
  position: sticky;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 24px;
  top: 0;
  background-color: white;
  z-index: 80;
`;

const LogoWrapper = styled.img`
  max-width: 150px;
  max-height: 90%;
  cursor: pointer;
`;

export const HeaderSimulator = () => {
  return (
    <HeaderContainer>
      <HeaderSection>
        <Link to="/" style={{ display: 'flex' }}>
          <ArrowBackIosIcon /> Retour vers SEEDS
        </Link>
      </HeaderSection>
      <HeaderSection centered>
        <p className="h3b">SEEDy</p>
      </HeaderSection>
    </HeaderContainer>
  );
};

export const HeaderProject = () => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const { user } = useUser();
  const isShareProject = project?.users.some(
    (u: ProjectUser) => u.id === user?._id && u.role === 'owner',
  );
  return (
    <HeaderContainer>
      <HeaderSection>
        {project && <ProjectBreadcrumb project={project!} />}
      </HeaderSection>
      <HeaderSection centered>
        <p className="h3b">SEEDS</p>
      </HeaderSection>
      <HeaderSection marginBetween="16px">
        {isShareProject && project && <ShareButton project={project} />}
        <UserMenu />
      </HeaderSection>
    </HeaderContainer>
  );
};

export const HeaderProjects = () => {
  const navigate = useNavigate();
  return (
    <HeaderContainer>
      <HeaderSection>
        <LogoWrapper
          id="logoWrapper"
          src="/logo Arviva.png"
          alt="logo Arviva"
          onClick={() => navigate('/')}
        />
      </HeaderSection>
      <HeaderSection centered>
        <p className="h3b">SEEDS</p>
      </HeaderSection>
      <HeaderSection>
        <a
          className="h6b"
          href="/reports"
          style={{
            marginRight: '32px',
          }}
        >
          Mes rapports
        </a>
        <a
          className="h6b"
          href="/simulator"
          style={{
            marginRight: '32px',
          }}
        >
          SEEDy
        </a>
        <UserMenu />
      </HeaderSection>
    </HeaderContainer>
  );
};

const BreadcrumbWrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: calc(100vw / 2 - 80px);
  gap: 10px;

  > * {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ProjectBreadcrumb = ({ project }: { project: Project }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const projectTitle = getProjectTitle(project.sectors);
  const isResults = location.pathname.includes('/results');
  const isActions = location.pathname.includes('/actions');
  const isTour = location.pathname.includes('/tour');
  const isBuildings = location.pathname.includes('/buildings');
  const isProjects = location.pathname.includes('/projects');
  const isProject =
    !isResults && !isActions && !isTour && !isBuildings && !isProjects;
  return (
    <BreadcrumbWrapper>
      <IconContainer onClick={() => navigate('/')}>
        <Home />
      </IconContainer>
      <IconContainer>
        <Next />
      </IconContainer>
      {isProject ? (
        <p className="h6r">{projectTitle}</p>
      ) : (
        <Link to={`/project/${project._id}`} className="h6r underline">
          {projectTitle}
        </Link>
      )}
      {isResults && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          <p className="h6b">Résultats complets</p>
        </>
      )}
      {isActions && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          <p className="h6b">Actions</p>
        </>
      )}
      {isBuildings && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          <p className="h4b">Salles</p>
        </>
      )}
      {isProjects && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          <p className="h4b">Projets</p>
        </>
      )}
      {isTour && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          <p className="h6b" data-tour="tour-transport-title">
            Calculateur Mobilité
          </p>
        </>
      )}
    </BreadcrumbWrapper>
  );
};

type HeaderSectionProps = {
  centered?: boolean;
  marginBetween?: string;
  children: ReactNode;
};

const HeaderSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  position: ${(props: HeaderSectionProps) =>
    props.centered ? 'absolute' : ''};
  left: ${(props: HeaderSectionProps) => (props.centered ? '50%' : '')};
  transform: ${(props: HeaderSectionProps) =>
    props.centered ? 'translate(-50%, 0)' : ''};
  > *:not(:last-child) {
    margin-right: ${(props: HeaderSectionProps) =>
      props.marginBetween ? props.marginBetween : ''};
  }
`;

export const HeaderSection = ({
  marginBetween,
  centered,
  children,
}: HeaderSectionProps) => {
  return (
    <HeaderSectionWrapper marginBetween={marginBetween} centered={centered}>
      {children}
    </HeaderSectionWrapper>
  );
};

export const HeaderButton = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const downloadFile = (blob: Blob, fileName: string) => {
  const anchorElement = document.createElement('a');

  document.body.appendChild(anchorElement);

  anchorElement.style.display = 'none';

  const url = window.URL.createObjectURL(blob);

  anchorElement.href = url;
  anchorElement.download = fileName;
  anchorElement.click();

  window.URL.revokeObjectURL(url);
};

const ShareButton = ({ project }: { project: Project }) => {
  const [openShare, setOpenShare] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const handleShareProject = () => {
    setOpenShare(true);
  };
  const handleDownloadProject = async () => {
    setLoading(true);

    const response = await authenticatedFetch(
      `${import.meta.env.VITE_API_URL}/projects/${project._id}`,
      {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/vnd.ms-excel',
          'Content-Type': 'application/json',
        }),
      },
    );
    const statisticFileBlob = await response.blob();

    const filename = `${keyify(project.name)}.xlsx`;

    setLoading(false);
    downloadFile(statisticFileBlob, filename || 'statistics.xlsx');
    setLoading(false);
  };
  return (
    <>
      <ShareProject
        open={openShare}
        onClose={() => setOpenShare(false)}
        project={project}
      />
      <div id="action-container"></div>
      <Tooltip title="Partager le projet">
        <HeaderButton onClick={handleShareProject}>
          <IconContainer>
            <Export />
          </IconContainer>
          <p className="h6r">Partager</p>
        </HeaderButton>
      </Tooltip>

      <Tooltip title={'Télécharger le projet'}>
        <HeaderButton onClick={handleDownloadProject}>
          <IconContainer>
            <DownloadForOfflineOutlinedIcon />
          </IconContainer>
          <p className="h6r">Télécharger</p>
          {loading && <CircularProgress sx={{ maxWidth: 20, maxHeight: 20 }} />}
        </HeaderButton>
      </Tooltip>
    </>
  );
};

export const HeaderReports = () => {
  const navigate = useNavigate();
  const { reportId, projectId } = useParams();
  const { report } = useReport(reportId);

  return (
    <HeaderContainer>
      <HeaderSection>
        {report && <ReportBreadcrumb report={report!} projectId={projectId} />}
        {!report && (
          <LogoWrapper
            id="logoWrapper"
            src="/logo Arviva.png"
            alt="logo Arviva"
            onClick={() => navigate('/')}
          />
        )}
      </HeaderSection>
      <HeaderSection centered>
        <p className="h3b">SEEDS</p>
      </HeaderSection>
      <HeaderSection>
        <a
          className="h6b"
          href="/"
          style={{
            marginRight: '32px',
          }}
        >
          Mes projets
        </a>
        <a
          className="h6b"
          href="/simulator"
          style={{
            marginRight: '32px',
          }}
        >
          SEEDy
        </a>
        <UserMenu />
      </HeaderSection>
    </HeaderContainer>
  );
};

const ReportBreadcrumb = ({
  report,
  projectId,
}: {
  report?: Report;
  projectId?: string;
}) => {
  const navigate = useNavigate();
  const project = report?.projects?.find(
    (project) => project._id.toString() === projectId,
  );
  return (
    <BreadcrumbWrapper>
      <IconContainer onClick={() => navigate('/')}>
        <Home />
      </IconContainer>
      <IconContainer>
        <Next />
      </IconContainer>
      <Link to={`/reports`} className={!!report ? 'h6r underline' : 'h6r'}>
        Mes rapports
      </Link>
      {!!report && (
        <>
          <IconContainer>
            <Next />
          </IconContainer>
          {!project && <p className="h6r">Rapport {report.name}</p>}
          {!!project && (
            <Link to={`/reports/${report._id}`} className="h6r underline">
              Rapport {report.name}
            </Link>
          )}

          {project && (
            <>
              <IconContainer>
                <Next />
              </IconContainer>
              <p className="h6b">
                {project.model.singularName} - {project.name}
              </p>
            </>
          )}
        </>
      )}
    </BreadcrumbWrapper>
  );
};
