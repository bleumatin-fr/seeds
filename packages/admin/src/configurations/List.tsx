import { Datagrid, DateField, List, TextField } from 'react-admin';

const ConfigurationList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

export default ConfigurationList;
