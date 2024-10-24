import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Model, ParameterInput, Project } from '@arviva/core';
import styled from '@emotion/styled';
import Button from '../ui/Button';

import { ReactComponent as Add } from '../ui/icons/add.svg';
import { ReactComponent as DateIcon } from '../ui/icons/date.svg';
import { ReactComponent as Flag } from '../ui/icons/flag.svg';
import { ReactComponent as Sort } from '../ui/icons/sort.svg';
import Loader from '../ui/Loader';

import useModels from './context/useModels';
import useProjects from './context/useProjects';
import CreateProjectModal from './CreateProjectModal';
import ProjectCard from './ProjectCard';

import AppLayout from '../layout/AppLayout';
import { HeaderProjects } from '../layout/Headers';
import { SortButton } from '../ui/Button';

import ProjectIllustration from './ProjectIllustration';

import {
  blocks,
  dashboardConfig2,
  dashboardText,
  sortByDate,
} from './ProjectsUtils';

const dashboardConfig = dashboardConfig2;
const buttonInsideContainer = true;

const ProjectsComponent = () => {
  return (
    <AppLayout header={<HeaderProjects />}>
      <Projects />
    </AppLayout>
  );
};

const ProjectsContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  padding: 32px 16px;
  gap: 24px;
  flex-direction: column;
  max-width: 1400px;
  margin: auto;
`;

const SortContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 24px;
  > div:first-of-type {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

interface RowProps {
  height: string;
  blocks: BlockProps[];
}

type RowContainerProps = {
  height: string;
};

const RowContainer = styled.div`
  width: 100%;
  height: ${(props: RowContainerProps) => props.height};
  display: flex;
  align-items: flex-start;
  gap: 16px;
`;

const getConfig = (blockId: string | null) => {
  if (!blockId) return null;
  let block: BlockProps = blocks[blockId as keyof object];
  block.width = '100%';
  return [
    {
      height: 'auto',
      blocks: [block],
    },
  ];
};

const Projects = () => {
  const [sortOrder, setSortOrder] = useState<'date' | 'completion'>('date');
  const { projects, loading } = useProjects();
  const { models } = useModels();

  const [searchParams] = useSearchParams();
  const isDashboard = !searchParams.has('type');

  const [openProjectCreation, setOpenProjectCreation] = useState(false);

  const [modelSelected, setModelSelected] = useState<Model | null>(null);

  const navigate = useNavigate();

  if ((!projects && loading) || !models) {
    return <Loader fullPage />;
  }

  const sortedProjects = projects!.sort((a: Project, b: Project) => {
    if (sortOrder === 'date') {
      return sortByDate(a, b);
    }
    return a.completionRate - b.completionRate;
  });

  const config = isDashboard
    ? dashboardConfig
    : getConfig(searchParams.get('type'));

  const handleNewProject = (model: string) => {
    const modelFound = models.find((m: Model) => m.type === model);
    if (modelFound) {
      setModelSelected(modelFound);
      setOpenProjectCreation(true);
    }
  };

  const handleSave = (values: ParameterInput[], modelType: string) => {
    navigate(`/project?values=${JSON.stringify(values)}&type=${modelType}`);
  };

  return (
    <ProjectsContainer>
      {modelSelected && (
        <CreateProjectModal
          open={openProjectCreation}
          setOpen={setOpenProjectCreation}
          onSave={handleSave}
          model={modelSelected}
          onClose={() => setModelSelected(null)}
        />
      )}
      {!isDashboard && (
        <SortContainer>
          <div>
            <Sort />
            <p>Trier par :</p>
          </div>
          <SortButton
            startIcon={<DateIcon />}
            className={sortOrder === 'date' ? 'selected' : ''}
            onClick={() => setSortOrder('date')}
          >
            Date de création
          </SortButton>
          <SortButton
            startIcon={<Flag />}
            className={sortOrder === 'completion' ? 'selected' : ''}
            onClick={() => setSortOrder('completion')}
          >
            Taux de remplissage
          </SortButton>
        </SortContainer>
      )}
      {config!.map((row: RowProps, rowIndex) => (
        <RowContainer height={row.height} key={rowIndex}>
          {row.blocks.map((block: BlockProps, blockIndex) => (
            <Block
              key={blockIndex}
              block={block}
              projects={sortedProjects!}
              onNewProject={handleNewProject}
            />
          ))}
        </RowContainer>
      ))}
    </ProjectsContainer>
  );
};

type BlockContainerProps = {
  width: string;
};

const BlockContainer = styled.div`
  height: 100%;
  width: ${(props: BlockContainerProps) => props.width};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  > p {
    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
`;

type BlockContentProps = {
  color: string;
};

const BlockContent = styled.div`
  background-color: ${(props: BlockContentProps) => props.color};
  padding: 16px;
  display: grid;
  border-radius: 16px;
  grid-template-rows: repeat(auto-fill, minmax(100px, 1fr));
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 16px;
  width: 100%;
  height: calc(100% - 32px);
  overflow: hidden;
`;

const NewProjectBlock = styled.div`
  background-color: transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed #000000;
  border-radius: 8px;
  gap: 16px;
`;

const NewProjectButton = styled(Button)`
  height: 26px;
  font-size: 14px;
  max-width: 90%;
`;

const IconContainer = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
`;

interface BlockProps {
  id: string;
  name: string;
  color: string;
  width: string;
  models: string[];
}

const Block = ({
  projects,
  onNewProject,
  block,
}: {
  block: BlockProps;
  onNewProject: (model: string) => void;
  projects: Project[];
}) => {
  const { models, name, color, width } = block;
  const { remove, duplicate } = useProjects();
  const navigate = useNavigate();
  const blockProjects = projects.filter((project) =>
    block.models.includes(project.model.type),
  );

  if (blockProjects.length === 0) {
    return <EmptyBlock block={block} onNewProject={onNewProject} />;
  }

  const handleDelete = (id: string) => async (event: any) => {
    return await remove(id);
  };

  const handleDuplicate = (id: string) => async (event: any) => {
    return await duplicate(id);
  };

  return (
    <BlockContainer width={width}>
      <BlockHeader>
        <p
          className="h5b"
          onClick={() => navigate(`/projects?type=${block.id}`)}
        >
          {name} ({blockProjects.length})
        </p>
        {!buttonInsideContainer &&
          models.map((model: string) => (
            <NewProjectButton
              key={model}
              startIcon={<Add />}
              variant="contained"
              onClick={() => onNewProject(model)}
            >
              {dashboardText.createButton[model as keyof object]}
            </NewProjectButton>
          ))}
      </BlockHeader>
      {!!blockProjects.length && (
        <BlockContent color={color}>
          {buttonInsideContainer && (
            <NewProjectBlock>
              {models.map((model: string) => (
                <NewProjectButtonDashboard
                  key={model}
                  model={model}
                  onClick={onNewProject}
                />
              ))}
            </NewProjectBlock>
          )}
          {blockProjects?.map((project: Project) => (
            <ProjectCard
              key={project._id.toString()}
              project={project}
              onClick={() => navigate(`/project/${project._id}`)}
              onDelete={handleDelete(project._id.toString())}
              onDuplicate={handleDuplicate(project._id.toString())}
            />
          ))}
        </BlockContent>
      )}
    </BlockContainer>
  );
};

type EmptyBlockContentProps = {
  color: string;
};

const EmptyBlockContent = styled.div`
  background-color: ${(props: EmptyBlockContentProps) => props.color};
  border-radius: 8px;
  height: 100%;
  padding: 16px;
  display: flex;
  gap: 16px;
  > div {
    border: 1px dashed #000000;
    border-radius: 8px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    :hover {
      border: 1px solid #000000;
      cursor: pointer;
      p.hxb {
        text-decoration: underline;
      }
    }
    p {
      max-width: 80%;
      text-align: center;
    }
  }
`;

const EmptyBlock = ({
  block,
  onNewProject,
}: {
  block: BlockProps;
  onNewProject: (model: string) => void;
}) => {
  const { models, name, width, color } = block;
  return (
    <BlockContainer width={width} data-tour="dashboard-block">
      <BlockHeader>
        <p className="h5b">{name}</p>
      </BlockHeader>
      <EmptyBlockContent color={color}>
        {models.map((model) => (
          <div onClick={() => onNewProject(model)} key={model}>
            <ProjectIllustration type={model} />
            <NewProjectButtonDashboard model={model} />
            <p className="hxr">
              {dashboardText.emptyBlock.description[model as keyof object]}
            </p>
          </div>
        ))}
      </EmptyBlockContent>
    </BlockContainer>
  );
};

const NewProjectButtonDashboardContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    p {
      text-decoration: underline;
      cursor: pointer;
    }
  }
`;

const NewProjectButtonDashboard = ({
  onClick,
  model,
}: {
  model: string;
  onClick?: (model: string) => void;
}) => {
  return (
    <NewProjectButtonDashboardContainer>
      <IconContainer>
        <Add />
      </IconContainer>
      <p className="hxb" onClick={() => onClick && onClick(model)}>
        {dashboardText.createButton[model as keyof object]}
      </p>
    </NewProjectButtonDashboardContainer>
  );
};

export default ProjectsComponent;
