import styled from '@emotion/styled';
import { useState } from 'react';
import {
  AutocompleteArrayInput,
  Datagrid,
  DateField,
  EditButton,
  FilterButton,
  List,
  ReferenceArrayInput,
  SelectInput,
  TextField,
  TextInput,
  TopToolbar,
} from 'react-admin';

import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';

import { CreateProjectField } from '../CreateProjectField';
import { SeeProjectField } from '../SeeProjectField';
import { SpreadsheetField } from '../SpreadsheetField';

import { LoadingButton } from '@mui/lab';
import httpClient from '../httpClient';
import CompletionField from './CompletionField';
import { Menu } from './Menu';
import UsersField from './UsersField';

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const downloadFile = (blob: Blob, fileName: string) => {
  const anchorElement = document.createElement('a');

  document.body.appendChild(anchorElement);

  anchorElement.style.display = 'none';

  const url = window.URL.createObjectURL(blob);

  anchorElement.href = url;
  anchorElement.download = fileName;
  anchorElement.click();

  window.URL.revokeObjectURL(url);
};

const ListActions = () => {
  const [loading, setLoading] = useState(false);
  const exportRawData = async () => {
    setLoading(true);

    const statisticFileBlob: Blob = await httpClient(
      `${import.meta.env.VITE_API_URL}/projects/statistics`,
      {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/vnd.ms-excel',
          'Content-Type': 'application/json',
        }),
      },
      'blob',
    );

    setLoading(false);
    downloadFile(statisticFileBlob, 'statistics.xlsx');
  };
  return (
    <TopToolbar>
      <FilterButton />
      <CreateProjectField />
      <LoadingButton
        startIcon={<DriveFolderUploadIcon />}
        onClick={exportRawData}
        size="small"
        disabled={loading}
        loading={loading}
      >
        Export Données Brutes
      </LoadingButton>
    </TopToolbar>
  );
};

const projectFilters = [
  <TextInput label="Search" source="q" alwaysOn />,
  <ReferenceArrayInput
    label="Users"
    reference="users"
    source="users"
    alwaysOn
    sort={{ field: 'fullname', order: 'ASC' }}
  >
    <AutocompleteArrayInput
      optionText={(user) =>
        `${user.firstName} ${user.lastName}`.trim() || user.email
      }
    />
  </ReferenceArrayInput>,
  <SelectInput
    label="Public"
    source="public"
    choices={[
      { id: true, name: 'Public' },
      { id: false, name: 'Privé' },
    ]}
  />,
  <SelectInput
    label="Deleted"
    source="deleted"
    defaultValue={true}
    choices={[
      { id: true, name: 'Yes' },
      { id: false, name: 'No' },
    ]}
  />,
];

const ProjectList = () => {
  return (
    <List
      filters={projectFilters}
      filterDefaultValues={{ deleted: false }}
      actions={<ListActions />}
      sort={{ field: 'public', order: 'DESC' }}
    >
      <Datagrid>
        <TextField source="name" />
        <TextField source="model.name" label="Type" />
        <UsersField source="users" />
        <CompletionField source="completionRate" />
        <DateField source="createdAt" showTime />
        <DateField source="updatedAt" showTime />
        <TextField source="model.versionNumber" />
        <ActionsContainer>
          <SpreadsheetField source="spreadsheetId" />
          <SeeProjectField source="id"></SeeProjectField>
          <EditButton size="small"></EditButton>
          <Menu />
        </ActionsContainer>
      </Datagrid>
    </List>
  );
};

export default ProjectList;
