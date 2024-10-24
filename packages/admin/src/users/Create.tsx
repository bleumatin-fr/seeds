import { BooleanInput, Create, SelectInput, SimpleForm, TextInput } from 'react-admin';

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput type="email" source="email" required />
      <TextInput source="firstName" required />
      <TextInput source="lastName" required />
      <TextInput source="company" />
      <SelectInput
        source="role"
        choices={[
          { id: 'user', name: 'Utilisateur' },
          { id: 'admin', name: 'Administrateur' },
        ]}
        defaultValue="user"
        required
      />
      <BooleanInput source="optin" />
    </SimpleForm>
  </Create>
);

export default UserCreate;
