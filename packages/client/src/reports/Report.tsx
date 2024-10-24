import { Result } from '@arviva/core';
import styled from '@emotion/styled';
import { useParams } from 'react-router-dom';
import { ResultDispatch } from '../results/Results';
import { TitleBlock } from '../ui/Block';
import { PageContainer } from '../ui/Container';
import useReport from './context/useReport';

const ReportTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Report = () => {
  const { reportId } = useParams();
  const { report } = useReport(reportId);

  if (!report) {
    return null;
  }

  return (
    <PageContainer noGap>
      <TitleBlock background="var(--green)">
        <ReportTitle>
          <h3 className="h3b">{report.name}</h3>
        </ReportTitle>
      </TitleBlock>
      {report.results.map((result: Result, index: number) => (
        <ResultDispatch result={result} key={index} />
      ))}
    </PageContainer>
  );
};

export default Report;
