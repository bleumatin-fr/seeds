import { BooleanInput, Edit, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="email" required />
      <TextInput source="firstName" required />
      <TextInput source="lastName" required />
      <TextInput source="company" />
      <SelectInput
        source="role"
        choices={[
          { id: 'user', name: 'Utilisateur' },
          { id: 'admin', name: 'Administrateur' },
        ]}
        required
      />
      <BooleanInput source="optin" />
    </SimpleForm>
  </Edit>
);

export default UserEdit;
