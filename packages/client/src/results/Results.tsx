import { useNavigate, useParams } from 'react-router-dom';

import { Result } from '@arviva/core';

import Button, { CustomLoadingButton } from '../ui/Button';
import { PageContainer } from '../ui/Container';
import { Abacus } from './ScoreCardComponent';

import styled from '@emotion/styled';
import { useCallback, useEffect } from 'react';
import { useQuery } from 'react-query';
import { authenticatedFetch } from '../authentication/authenticatedFetch';
import { useProject } from '../project/context/useProject';
import { TitleBlock } from '../ui/Block';
import ExportIcon from '../ui/icons/export.svg?react';
import SkipIcon from '../ui/icons/skip.svg?react';
import Markdown from '../ui/Markdown';
import BarStacked1DComponent from './BarStacked1DComponent';
import BarStacked2DComponent from './BarStacked2DComponent';
import GlobalScoreComponent from './GlobalScore';
import NavComponent from './Nav';
import Pie1DComponent, { Pie1DLegend } from './Pie1DComponent';
import ResultGraph from './ResultGraph';
import SectionTitle from './SectionTitle';
import TreemapComponent from './TreemapComponent';

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const Results = () => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const navigate = useNavigate();
  const {
    data: pdfData,
    refetch: refetchPdf,
    isFetching: isLoadingPdf,
  } = useQuery(
    `project-pdf-${projectId}`,
    () => {
      if (!project) {
        return;
      }
      return authenticatedFetch(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/pdf-report`,
      );
    },
    {
      enabled: false,
    },
  );

  const downloadPdf = useCallback(async () => {
    if (!project || !pdfData) {
      return;
    }
    const pdfBlob = await pdfData.blob();
    const url = await URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name
      .toLocaleLowerCase()
      .replace(/\s/g, '-')} - Résultats complets.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [pdfData, project]);

  useEffect(() => {
    downloadPdf();
  }, [downloadPdf]);
  if (!project) {
    return null;
  }

  return (
    <PageContainer noGap>
      <TitleBlock background="var(--lightgreen)">
        <h3>{project.name} - Résultats complets</h3>
        <p>Découvrez les impacts détaillés de votre projet ci-dessous</p>
        <ButtonContainer>
          <Button
            onClick={() => navigate(`/project/${projectId}/actions`)}
            startIcon={<SkipIcon />}
          >
            Passer à l’action !
          </Button>
          <CustomLoadingButton
            onClick={() => refetchPdf()}
            loading={isLoadingPdf}
            disabled={isLoadingPdf}
            startIcon={<ExportIcon />}
          >
            Récupérer le rapport PDF
          </CustomLoadingButton>
        </ButtonContainer>
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

export const ResultDispatch = ({ result }: { result: Result }) => {
  switch (result.type) {
    case 'nav':
      return <NavComponent result={result} />;
    case 'title':
      return <SectionTitle result={result} />;
    case 'globalScore':
      return (
        <GlobalScoreComponent title={result.title!} score={result.score}>
          {result.text && (
            <p className="hxr">
              <Markdown>{result.text}</Markdown>
            </p>
          )}
        </GlobalScoreComponent>
      );
    case 'scoreCard':
      return (
        <GlobalScoreComponent title={result.title!} score={result.score}>
          {result.displayData! ? (
            <Abacus result={result} visible={result.displayData!} />
          ) : (
            <p>
              Votre score sera affiché dès que vous aurez répondu aux premières
              questions associés. Il est également possible que vous ne soyez
              pas concerné.
            </p>
          )}
        </GlobalScoreComponent>
      );
    case 'treemap':
      return (
        <ResultGraph
          result={result}
          graph={<TreemapComponent result={result} />}
        />
      );
    case 'pie1D':
      return (
        <ResultGraph
          result={result}
          graph={<Pie1DComponent result={result} />}
          legend={<Pie1DLegend result={result} />}
        />
      );
    case 'barStacked1D':
      const fullWidth = (result?.data?.data?.length || 0) > 3;
      return (
        <ResultGraph
          result={result}
          fullWidth={fullWidth}
          graph={<BarStacked1DComponent result={result} />}
        />
      );
    case 'barStacked2D':
      return (
        <ResultGraph
          result={result}
          graph={<BarStacked2DComponent result={result} />}
        />
      );
  }
  return null;
};

export default Results;
