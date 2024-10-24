import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import GroupsIcon from '@mui/icons-material/Groups';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import Chip from '@mui/material/Chip';
import { MouseEvent, ReactElement } from 'react';
import {
  Button,
  DatagridConfigurable,
  DateField,
  EditButton,
  List,
  NumberField,
  RaRecord,
  TextField,
  useRecordContext,
  useRefresh,
} from 'react-admin';
import httpClient from '../httpClient';
import { SpreadsheetDownloadField } from '../SpreadsheetDownloadField';
import { SpreadsheetUploadField } from '../SpreadsheetUploadField';
import TabbedDatagrid from './TabbedDatagrid';

export const models = [
  { id: 'project', name: 'Projet', icon: <TheaterComedyIcon /> },
  { id: 'building', name: 'Bâtiment / Site', icon: <CorporateFareIcon /> },
  { id: 'operation', name: 'Fonctionnement', icon: <GroupsIcon /> },
  { id: 'simulation', name: 'Simulation', icon: <VideogameAssetIcon /> },
];

export const statusColors: {
  [key: string]: 'success' | 'warning' | 'error' | 'info' | undefined;
} = {
  draft: 'info',
  published: 'success',
  archived: undefined,
};

const StatusField = ({ source }: { source: string }) => {
  const record = useRecordContext();

  if (!record) return null;

  const value = record[source];

  return <Chip label={value} color={statusColors[value]} />;
};

const PublishButton = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  if (!record) {
    return null;
  }

  if (record.status !== 'draft') {
    return null;
  }

  const handlePublishClicked = async (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    await httpClient(
      `${process.env.REACT_APP_API_URL}/models/${record.id}/publish`,
      {
        method: 'POST',
      },
    );
    refresh();
  };

  return (
    <Button
      startIcon={<CheckCircleOutlineIcon />}
      label="Publish"
      onClick={handlePublishClicked}
    />
  );
};

const DisplayIf = ({
  condition,
  children,
}: {
  condition: (record: RaRecord) => boolean;
  children: ReactElement | ReactElement[];
}) => {
  const record = useRecordContext();
  if (!record) {
    return null;
  }

  if (!condition(record)) {
    return null;
  }

  return <>{children}</>;
};

export const ModelList = () => (
  <List
    filterDefaultValues={{
      type: 'project',
    }}
    sort={{ field: 'versionNumber', order: 'DESC' }}
    queryOptions={{ refetchInterval: 3000 }}
  >
    <TabbedDatagrid source="type" tabs={models}>
      {({ isXSmall, filterValues }) => (
        <DatagridConfigurable
          rowClick="edit"
          sort={{ field: 'versionNumber', order: 'DESC' }}
        >
          <StatusField source="status" />
          <TextField source="versionNumber" />
          <SpreadsheetDownloadField source="spreadsheetId" />
          <DisplayIf condition={(record) => record.status === 'draft'}>
            <SpreadsheetUploadField />
          </DisplayIf>
          <DateField source="createdAt" />
          <DisplayIf condition={(record) => record.type !== 'simulation'}>
            <NumberField source="projectsCount" />
          </DisplayIf>
          <DisplayIf condition={(record) => record.status === 'draft'}>
            <EditButton />
            <PublishButton />
          </DisplayIf>
        </DatagridConfigurable>
      )}
    </TabbedDatagrid>
  </List>
);

export default ModelList;
