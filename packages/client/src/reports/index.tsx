import { useNavigate } from 'react-router-dom';

import styled from '@emotion/styled';
import { useState } from 'react';
import Button from '../ui/Button';
import useConfiguration from '../useConfiguration';
import useReports from './context/useReports';
import CreateReportModal from './CreateReportModal';
import BaseEmptyIllustration from './images/blank_canvas.svg?react';
import ReportCard from './ReportCard';

const ReportsContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
`;

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Layout = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  padding: 32px 16px;
  gap: 24px;
  flex-direction: column;
  max-width: 1400px;
  margin: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const NoReport = styled.div`
  margin: auto;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const MessageContainer = styled.div`
  display: flex;
  text-align: center;
  flex-direction: column;
  gap: 16px;

`;

const EmptyIllustration = styled(BaseEmptyIllustration)`
  width: 300px;
  filter: grayscale(95%) brightness(120%);
  opacity: 0.8;
  flex-shrink: 1;
`;

const Reports = () => {
  const navigate = useNavigate();
  const { reports, remove } = useReports();
  const [open, setOpen] = useState(false);
  const { configuration } = useConfiguration();

  if (!reports) return null;

  const handleReportClicked = (reportId: string) => () => {
    navigate(`/reports/${reportId}`);
  };

  const handleReportDeleted = (reportId: string) => async (event: any) => {
    return await remove(reportId);
  };

  if (!reports || reports.length === 0) {
    return (
      <Layout>
        <HeaderContainer>
          <p className="h5b">Mes rapports</p>
        </HeaderContainer>
        <CreateReportModal
          open={open}
          setOpen={setOpen}
          onClose={() => {
            setOpen(false);
          }}
        />
        <ReportsContainer>
          <NoReport>
            <EmptyIllustration />
            <MessageContainer
              dangerouslySetInnerHTML={{
                __html: configuration['reports.introduction'],
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ height: '56px' }}
            >
              Créez votre premier rapport
            </Button>
          </NoReport>
        </ReportsContainer>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <HeaderContainer>
          <p className="h5b">Mes rapports ({reports.length})</p>
          <ButtonContainer>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ height: '36px' }}
            >
              Créer un rapport
            </Button>
          </ButtonContainer>
        </HeaderContainer>

        <CreateReportModal
          open={open}
          setOpen={setOpen}
          onClose={() => {
            setOpen(false);
          }}
        />
        <ReportsContainer>
          {reports.map((report) => (
            <ReportCard
              report={report}
              key={report._id.toString()}
              onClick={handleReportClicked(report._id.toString())}
              onDelete={handleReportDeleted(report._id.toString())}
            />
          ))}
        </ReportsContainer>
      </Layout>
    </>
  );
};

export default Reports;
