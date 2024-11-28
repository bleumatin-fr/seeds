import { Report } from '@arviva/core';
import { useQuery } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

const getReport = async (reportId?: string): Promise<Report | undefined> => {
  if(!reportId) return undefined;
  const response = await authenticatedFetch(
    `${import.meta.env.VITE_API_URL}/reports/${reportId}`,
  );
  if(!response.ok) return undefined;
  return await response.json();
};

const useReport = (reportId: string | undefined) => {
  const reportQuery = useQuery(
    ['report', reportId],
    () => getReport(reportId),
    {
      useErrorBoundary: true,
    },
  );

  return {
    report: reportQuery.data,
    loading: reportQuery.isLoading,
    error: reportQuery.error,
  };
};

export default useReport;
