import styled from '@emotion/styled';
import { CreateBase, SimpleForm, useNotify, useRedirect } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import httpClient from '../httpClient';
import ConfigErrorsStep from './ConfigErrorsStep';
import FileUploadStep from './FileUploadStep';
import FunctionErrorsStep from './FunctionErrorsStep';
import ModelInformationStep from './ModelInformationStep';
import ModelSelector from './ModelSelectorStep';

const API_URL = import.meta.env.VITE_API_URL;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  gap: 1rem;
  width: 100%;
`;

const CreateWizard = () => {
  const { watch } = useFormContext();
  const record = watch();
  return (
    <Container>
      <ModelSelector source="type" />
      {record?.type && (
        <FileUploadStep
          source="spreadsheet"
          configErrorsSource="configErrors"
          functionErrorsSource="functionErrors"
          modelType={record.type}
        />
      )}
      {record?.configErrors && record?.configErrors.length > 0 && (
        <ConfigErrorsStep source="configErrors" />
      )}
      {record.spreadsheet &&
        record?.functionErrors &&
        record?.functionErrors.length > 0 && (
          <FunctionErrorsStep source="functionErrors" />
        )}
      {record.spreadsheet && !record?.configErrors.length && (
        <ModelInformationStep />
      )}
    </Container>
  );
};

const ModelCreate = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  const onSave = async (data: any) => {
    let formData = new FormData();
    [
      'spreadsheet',
      'changelog',
      'type',
      'userInformation',
      'versionNumber',
    ].forEach((key) => {
      formData.append(key, data[key]);
    });

    try {
      const response = await httpClient(`${API_URL}/models`, {
        method: 'POST',
        body: formData,
        // next line set a header object with no content type
        // so that httpClient doesnt set application/json while
        // we need multipart/form-data
        headers: new Headers({}),
      });

      if (response.status === 200) {
        notify(`Model created`, {
          type: 'success',
        });
        redirect('list', 'models');
      } else {
        console.error(response);
      }
    } catch (error: any) {
      notify(error.message, {
        type: 'error',
      });
    }
  };
  return (
    <CreateBase>
      <SimpleForm toolbar={false} component={undefined} onSubmit={onSave}>
        <CreateWizard />
      </SimpleForm>
    </CreateBase>
  );
};
export default ModelCreate;
