import {
  ArrayInput,
  AutocompleteInput,
  BooleanInput,
  DateInput,
  Edit,
  NumberInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TextInput,
  useRecordContext,
} from 'react-admin';

const ProjectTitle = () => {
  const record = useRecordContext();
  return <span>{record?.name} Project</span>;
};

const ProjectEdit = () => (
  <Edit title={<ProjectTitle />}>
    <SimpleForm>
      <TextInput source="name" disabled />
      <BooleanInput label="Public" source="public" />

      <NumberInput source="completionRate" disabled />
      <DateInput source="createdAt" disabled />
      <DateInput source="updatedAt" disabled />
      <DateInput source="deletedAt" disabled/>

      <ArrayInput source="users" label="User access">
        <SimpleFormIterator inline>
          <ReferenceInput
            reference="users"
            source="id"
            sort={{ field: 'fullname', order: 'ASC' }}
          >
            <AutocompleteInput
              label="User"
              optionText={(user) =>
                `${user.firstName} ${user.lastName}`.trim() || user.email
              }
            />
          </ReferenceInput>
          <SelectInput
            source="role"
            choices={[
              { id: 'owner', name: 'Owner' },
              { id: 'user', name: 'User' },
            ]}
          />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Edit>
);

export default ProjectEdit;
