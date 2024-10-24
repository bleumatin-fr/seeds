import { useParams } from 'react-router-dom';
import { ResultDispatch } from '../results/Results';
import { TitleBlock } from '../ui/Block';
import { PageContainer } from '../ui/Container';
import useReport from './context/useReport';

const ReportProjectResults = () => {
  const { reportId, projectId } = useParams();
  const { report } = useReport(reportId);

  if (!report) {
    return null;
  }

  const project = report.projects.find(
    (project) => project._id.toString() === projectId,
  );

  if (!project) {
    return null;
  }

  return (
    <PageContainer noGap>
      <TitleBlock background="var(--lightgreen)">
        <h3 className="h3b">{report.name}</h3>
        <h4 className="hxr">{project.name}</h4>
      </TitleBlock>
      {project.results
        .filter(
          (result) =>
            result.scope === 'complete' &&
            ((typeof result.display !== 'undefined' && result.display) ||
              typeof result.display === 'undefined'),
        )
        .map((result, index) => (
          <ResultDispatch result={result} key={index} />
        ))}
    </PageContainer>
  );
};

export default ReportProjectResults;
