import { Report } from '@arviva/core';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { authenticatedFetch } from '../../authentication/authenticatedFetch';

const getReports = async (filter: any): Promise<Report[]> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/reports?${new URLSearchParams(
      filter,
    ).toString()}`,
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const removeReport = async (reportId: string): Promise<Report> => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/reports/${reportId}`,
    {
      method: 'DELETE',
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const createReport = async ({
  projects,
  name,
  startDate,
  endDate,
}: {
  projects: {
    id: string;
    value?: number;
  }[];
  name: string;
  startDate: Date;
  endDate: Date;
}) => {
  const response = await authenticatedFetch(
    `${process.env.REACT_APP_API_URL}/reports`,
    {
      method: 'POST',
      body: JSON.stringify({ projects, name, startDate, endDate }),
    },
  );
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

const useReports = (filter?: any) => {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery(
    ['reports', JSON.stringify(filter)],
    () => getReports(filter),
    {
      useErrorBoundary: true,
    },
  );

  const createReportMutation = useMutation(
    ({
      projects,
      name,
      startDate,
      endDate,
    }: {
      projects: {
        id: string;
        value?: number;
      }[];
      name: string;
      startDate: Date;
      endDate: Date;
    }) => createReport({ projects, name, startDate, endDate }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports']);
      },
    },
  );

  const removeReportMutation = useMutation(
    (reportId: string) => removeReport(reportId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reports']);
      },
    },
  );
  return {
    reports: reportsQuery.data,
    loading:
      reportsQuery.isLoading ||
      createReportMutation.isLoading ||
      removeReportMutation.isLoading,
    create: createReportMutation.mutateAsync,
    remove: removeReportMutation.mutateAsync,
  };
};

export default useReports;
