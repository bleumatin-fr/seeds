import { Edit, SimpleForm, TextInput, useRecordContext } from 'react-admin';
import { JsonInput } from 'react-admin-json-view';

const ModelTitle = () => {
  const record = useRecordContext();
  return <span>{record?.name} Model</span>;
};

const ModelEdit = () => (
  <Edit title={<ModelTitle />}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="singularName" />
      <TextInput source="versionNumber" />
      <TextInput source="status" />
      <TextInput source="type" />
      <TextInput source="description" multiline fullWidth />
      <JsonInput source="config" />
    </SimpleForm>
  </Edit>
);

export default ModelEdit;
