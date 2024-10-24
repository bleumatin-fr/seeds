import { Sector } from '@arviva/core';
import styled from '@emotion/styled';
import { Button, Tooltip } from '@mui/material';
import { useTour } from '@reactour/tour';
import { Helmet } from 'react-helmet';
import { useLocation, useParams } from 'react-router-dom';

import MostImpactfulActions from '../actions/card/MostImpactfulActions';
import ResultsSimple from '../results/ResultsSimple';
import { getProjectTitle, useProject } from './context/useProject';
import Nav from './Nav';
import Parameters from './Parameters';
import TourConnector from './TourConnector';

import HistoryIcon from '@mui/icons-material/History';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import useUser from '../authentication/context/useUser';
import { HeaderButton, IconContainer } from '../layout/Headers';
import useOnboarding from '../onboarding/useOnboarding';
import DisabledFeature from './DisabledFeature';
import { ReactComponent as BaseLoadingIllustration } from './images/water-crops.svg';
import ModalVersionUpdate from './ModalVersionUpdate';

export interface SimulatorOptions {
  secondaryNav: boolean;
}

const simulatorOptions = {
  secondaryNav: false,
};

const Container = styled.div`
    width: 100%;
    background-color: var(--backgroundColor);
    display: flex;
    gap: 16px;
    padding: 0 16px;
  }
`;

type SectorComponentWrapperProps = {
  depth: number;
};

const SectorComponentWrapper = styled.div`
  margin-bottom: ${(props: SectorComponentWrapperProps) =>
    props.depth === 0 ? '16px' : '0px'};
  background-color: white;
`;

const LeftColumn = styled.div`
  width: min(65%, calc(100% - 400px));
  border-radius: 8px;
  position: sticky;
  top: 64px;
`;

const RightColumn = styled.div`
  width: max(35%, 400px);
  height: calc(100vh - 96px);
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectorWrapper = styled.div`
  width: 100%;
  background-color: white;
  padding: 0 16px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  margin-top: 184px;
  button {
    margin-top: 40px;
  }
`;

const LoadingIllustration = styled(BaseLoadingIllustration)`
  width: 600px;
  filter: grayscale(95%) brightness(120%);
  opacity: 0.8;
`;

export const Loading = () => (
  <LoadingContainer>
    <LoadingIllustration />
    <p className="h2b">
      Préparation de votre environnement de travail en cours...
    </p>
  </LoadingContainer>
);

const HeaderContainer = styled.div`
  padding-top: 16px;
  background-color: var(--backgroundColor);
  position: sticky;
  top: 64px;
  z-index: 120;
`;

const NavContainer = styled.div`
  background-color: white;
  border-radius: 8px 8px 0 0;
`;

const MainContainer = styled.div`
  padding: 0;
  background-color: var(--backgroundColor);
`;

const VersionningButton = ({
  onClick,
  nodeSelector,
}: {
  onClick?: () => void;
  nodeSelector: string;
}) => {
  const element = document.querySelector(nodeSelector);
  if (!element) return null;
  return ReactDOM.createPortal(
    <Tooltip title="Historique du modèle">
      <HeaderButton onClick={onClick}>
        <IconContainer>
          <HistoryIcon />
        </IconContainer>
        <p className="h6r">Historique</p>
      </HeaderButton>
    </Tooltip>,
    element,
  );
};

export const ProjectForm = () => {
  const [openModalVersionUpdate, setOpenModalVersionUpdate] = useState(false);
  const { projectId } = useParams();
  const { project, loading, updateLastSeenAt } = useProject(projectId);
  const projectTitle = getProjectTitle(project?.sectors);
  const location = useLocation();
  const { user } = useUser();
  const [lastSeenAt, setLastSeenAt] = useState<Date | undefined>();

  useEffect(() => {
    if (loading || !project) {
      return;
    }

    const userProject = project?.users.find(
      (u) => u.id.toString() === user?._id.toString(),
    );

    const seen = !userProject
      ? new Date(2900, 0, 0)
      : userProject?.lastSeenAt
      ? new Date(userProject?.lastSeenAt)
      : new Date(1900, 0, 0);
    const published = project?.model.publishedAt
      ? new Date(project.model.publishedAt)
      : new Date(1901, 0, 0);
    if (!seen || seen < published) {
      setLastSeenAt(seen);
      setOpenModalVersionUpdate(true);
    }
  }, [
    lastSeenAt,
    loading,
    location,
    project,
    project?.model.publishedAt,
    project?.users,
    user?._id,
  ]);

  useEffect(() => {
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      const element = document.querySelector(scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    }
  }, [location]);

  if (!project) return null;

  const handleModalVersionUpdateClosed = () => {
    setOpenModalVersionUpdate(false);
    updateLastSeenAt();
  };

  return (
    <Container data-tour="project-form">
      <VersionningButton
        onClick={() => setOpenModalVersionUpdate(true)}
        nodeSelector="#action-container"
      />
      <ModalVersionUpdate
        open={openModalVersionUpdate}
        onClose={handleModalVersionUpdateClosed}
        project={project}
        lastSeenAt={lastSeenAt}
      />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{`Arviva - SEEDS - ${projectTitle}`}</title>
      </Helmet>
      <LeftColumn>
        <HeaderContainer>
          <NavContainer>
            <Nav />
          </NavContainer>
        </HeaderContainer>
        <MainContainer>
          <SectorWrapper>
            <SectorComponent
              sectors={project?.sectors}
              depth={0}
              upperSector={null}
              options={simulatorOptions}
            />
          </SectorWrapper>
        </MainContainer>
      </LeftColumn>
      <RightColumn>
        <ResultsSimple results={project?.results} loading={loading} />
        <MostImpactfulActions actions={project?.actions} />
      </RightColumn>
    </Container>
  );
};

export const ScrollToTopOnce = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
};

export const StartTour = ({ tour }: { tour: string }) => {
  const { enabledTour } = useOnboarding();
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (enabledTour === tour) {
      setTimeout(() => {
        setIsOpen(true);
      }, 350);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const ScrollHandleContainer = styled.div`
  position: relative;
  top: -200px;
`;

export const ScrollHandle = React.forwardRef<HTMLDivElement, any>(
  (props, ref) => {
    const [top, setTop] = useState(0);

    useEffect(() => {
      const categoriesWrapper = document.querySelector('.categories_wrapper');
      if (!categoriesWrapper) return;
      const bottom = categoriesWrapper.getBoundingClientRect().bottom;
      setTop(bottom + (props.offset || 0) + 20);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <ScrollHandleContainer
        {...props}
        ref={ref}
        style={{ top: -top }}
      ></ScrollHandleContainer>
    );
  },
);

export const SectorComponent = ({
  sectors,
  depth,
  upperSector,
  options,
}: {
  sectors?: Sector[];
  depth: number;
  upperSector: Sector | null;
  options: SimulatorOptions;
}) => {
  const { projectId } = useParams();
  const { project, updateParameter } = useProject(projectId);

  const getSectorId = (
    sector: Sector,
    upperSector: Sector | null,
    depth: number,
  ) => {
    return upperSector && depth > 0
      ? `${upperSector.information.name}-${sector.information.name}-${depth}`.replace(
          /\W/g,
          '_',
        )
      : `${sector.information.name}-${depth}`.replace(/\W/g, '_');
  };

  return (
    <>
      {(sectors || []).map((sector) => {
        const displayHeader =
          (sector.parameters.length > 0 || sector.sectors.length > 0) &&
          depth < 3;
        const sectorId = getSectorId(sector, upperSector, depth);

        return (
          <SectorComponentWrapper
            key={`${sector.information.name}-${depth}`}
            depth={depth}
          >
            <ScrollHandle id={sectorId}></ScrollHandle>
            {displayHeader && (
              <SectorHeader
                upperSector={upperSector}
                sector={sector}
                depth={depth}
                information={sector.information}
                subsectors={sector.sectors}
                sectorId={sectorId}
                options={options}
                externalModules={
                  project?.model.config.parameters.externalModules
                }
              />
            )}
            {sector.parameters.length > 0 && (
              <Parameters
                autofocusFirst={false}
                parameters={sector.parameters}
                onUpdateParameter={updateParameter}
              />
            )}
            {sector.sectors.length > 0 && (
              <SectorComponent
                sectors={sector.sectors}
                depth={depth + 1}
                upperSector={sector}
                options={options}
              />
            )}
          </SectorComponentWrapper>
        );
      })}
    </>
  );
};

type SectorHeaderWrapperProps = {
  backgroundColor: string;
};

const SectorHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  color: black;
  margin-bottom: 8px;
  justify-content: space-between;
  &.level0 {
    top: 236px;
    position: sticky;
    padding: 14px 16px;
    border-radius: 4px;
    margin-bottom: 16px;
    background-color: ${(props: SectorHeaderWrapperProps) =>
      props.backgroundColor || 'lightgrey'};
    z-index: 110;
  }
  &.level0 p {
    color: black;
  }
  &.level1 {
    width: 100%;
    padding: 30px 0 16px 20px;
    top: 267px;
    background-color: white;
    position: sticky;
    z-index: 100;
  }
  &.level1 p {
    line-height: 18px;
  }
  &.level1 p::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: ${(props: SectorHeaderWrapperProps) =>
      props.backgroundColor || 'lightgrey'};
    left: 0;
    display: block;
    line-height: 18px;
    margin-top: 1px;
  }
  &.level2 p {
    font-style: italic;
  }
`;

const headerClassName: { [key: number]: string } = {
  0: 'h4b',
  1: 'h5b',
  2: 'hxb',
};

const CategoriesWrapper = styled.div`
  display: flex;
`;

interface SectorHeaderProps {
  sector: Sector;
  upperSector: Sector | null;
  depth: number;
  sectorId: string;
  information: {
    color: string;
    name: string;
  };
  subsectors: Sector[];
  options: SimulatorOptions;
  externalModules?: {
    [key: string]: string[];
  };
}

// https://stackoverflow.com/a/72595895/1665540
const contrastColor = (backgroundColor: string) => {
  try {
    return ['black', 'white'][
      ~~(
        [1, 3, 5]
          .map((p) => parseInt(backgroundColor.substr(p, 2), 16))
          .reduce((r, v, i) => [0.299, 0.587, 0.114][i] * v + r, 0) < 128
      )
    ];
  } catch (e) {
    return 'black';
  }
};

export const SectorHeader = ({
  sector,
  upperSector,
  depth,
  information,
  sectorId,
  subsectors,
  options,
  externalModules,
}: SectorHeaderProps) => {
  const {
    disabledModules: { transport: isTransportModuleDisabled },
  } = useOnboarding();

  if (depth > 0) return null;
  const { color, name } = information;
  const navigation = subsectors.map((subsector) => ({
    name: subsector.information.name,
    key: `${sector.information.name}-${subsector.information.name}-${
      depth + 1
    }`,
    color: subsector.information.color,
  }));

  const handleButtonClicked = (hash: string) => () => {
    document?.getElementById(hash)?.scrollIntoView();
  };

  const displayTourButton = externalModules?.tour.includes(
    `sector[${depth}]:${name}`,
  );

  return (
    <>
      <SectorHeaderWrapper backgroundColor={color} className={`level${depth}`}>
        <p className={headerClassName[depth]}>{name}</p>
        {depth === 0 && options.secondaryNav && navigation.length > 0 && (
          <CategoriesWrapper className="categories_wrapper">
            {navigation.map(({ name, key, color }) => (
              <Button
                key={key}
                onClick={handleButtonClicked(key)}
                size="small"
                sx={{
                  '&:hover': {
                    bgcolor: color,
                    color: contrastColor(color || '#ffffff'),
                  },
                }}
              >
                {name}
              </Button>
            ))}
          </CategoriesWrapper>
        )}
      </SectorHeaderWrapper>
      {displayTourButton && !isTransportModuleDisabled && (
        <TourConnector sectorId={sectorId} />
      )}
      {displayTourButton && isTransportModuleDisabled && <DisabledFeature />}
    </>
  );
};
