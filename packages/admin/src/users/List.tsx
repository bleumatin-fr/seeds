import {
  BooleanField,
  CreateButton,
  Datagrid,
  DateField,
  ExportButton,
  List,
  SelectField,
  TextField,
  TextInput,
  TopToolbar,
} from 'react-admin';

const projectFilters = [<TextInput label="Search" source="q" alwaysOn />];

const UserActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton maxResults={10000} />
  </TopToolbar>
);

export const UserList = () => (
  <List
    sort={{ field: 'createdAt', order: 'DESC' }}
    filters={projectFilters}
    actions={<UserActions />}
  >
    <Datagrid rowClick="edit">
      <TextField source="email" />
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="company" />
      <SelectField
        source="role"
        choices={[
          { id: 'user', name: 'Utilisateur' },
          { id: 'admin', name: 'Administrateur' },
        ]}
      />
      <DateField source="createdAt" showTime />
      <DateField source="lastLogin" showTime />
      <DateField source="lastActive" showTime />
      <BooleanField source="optin" />
    </Datagrid>
  </List>
);

export default UserList;
