import { Edit, SimpleForm } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text';

const ConfigurationEdit = () => (
  <Edit>
    <SimpleForm>
      <RichTextInput source="value" />
    </SimpleForm>
  </Edit>
);

export default ConfigurationEdit;
