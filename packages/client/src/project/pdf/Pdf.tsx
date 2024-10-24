import { useParams } from 'react-router-dom';

import useUser from '../../authentication/context/useUser';
import { flattenParameters, useProject } from '../context/useProject';
import { APropos } from './pages/APropos';
import { BiodiversityResults } from './pages/BiodiversityResults';
import { Co2Results } from './pages/Co2Results';
import { Cover } from './pages/Cover';
import { LastPage } from './pages/LastPage';
import { ResourcesResults } from './pages/ResourceResults';

const Pdf = () => {
  const { projectId } = useParams();
  const { user } = useUser();
  const { project } = useProject(projectId);
  if (!project || !user) {
    return null;
  }

  const parameters = flattenParameters(project?.sectors);
  return (
    <>
      <Cover project={project} user={user} parameters={parameters} />
      <Co2Results project={project} user={user} parameters={parameters} />
      <BiodiversityResults
        project={project}
        user={user}
        parameters={parameters}
      />
      <ResourcesResults project={project} user={user} parameters={parameters} />
      <APropos project={project} user={user} parameters={parameters} />
      <LastPage />
    </>
  );
};

export default Pdf;
