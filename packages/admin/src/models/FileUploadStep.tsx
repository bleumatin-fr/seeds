import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useInput, useNotify } from 'react-admin';
import FileUpload from 'react-mui-fileuploader';

const API_URL = process.env.REACT_APP_API_URL;

const FileUploadStep = ({
  source,
  configErrorsSource,
  functionErrorsSource,
  modelType,
}: {
  source: string;
  configErrorsSource: string;
  functionErrorsSource: string;
  modelType: string;
}) => {
  const { field } = useInput({
    source,
  });
  const { field: configErrorsField } = useInput({
    source: configErrorsSource,
  });
  const { field: functionErrorsField } = useInput({
    source: functionErrorsSource,
  });
  const [loading, setLoading] = useState(false);

  const notify = useNotify();

  const handleFilesChange = async (files: any[]) => {
    setLoading(true);
    const fileToUpload = files[0];

    if (!fileToUpload) {
      setLoading(false);
      field.onChange(null);
      functionErrorsField.onChange([]);
      configErrorsField.onChange([]);
      return;
    }

    let formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('testOnly', 'true');

    try {
      const response = await fetch(`${API_URL}/spreadsheets/${modelType}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        const { functionErrors } = data;
        if (functionErrors.length > 0) {
          functionErrorsField.onChange(functionErrors);
        }

        field.onChange(fileToUpload);
      } else {
        const { configErrors } = data;
        if (configErrors.length > 0) {
          configErrorsField.onChange(configErrors);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      notify(`Upload failed`, {
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadError = (error: any) => {
    notify(`Upload failed`, { type: 'error' });
  };

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <FileUpload
        getBase64={false}
        multiFile={false}
        disabled={false}
        title=""
        header="Drag and drop a file"
        leftLabel="or"
        buttonLabel="click here"
        rightLabel="to select files"
        maxFileSize={50}
        maxUploadFiles={1}
        maxFilesContainerHeight={357}
        acceptedType={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
        errorSizeMessage={'File seems too big'}
        onFilesChange={handleFilesChange}
        onError={handleFileUploadError}
        BannerProps={{ elevation: 0, variant: 'outlined' }}
        showPlaceholderImage={false}
        LabelsGridProps={{ md: 8 }}
        ContainerProps={{
          elevation: 0,
          variant: 'outlined',
          sx: { p: 2 },
        }}
      />
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            bottom: 16,
            height: 'calc(100% - 32px)',
            width: 'calc(100% - 32px)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            backgroundColor: 'rgb(52, 163, 171)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            color: 'white',
            fontSize: '1.5rem',
          }}
        >
          <CircularProgress /> Loading...
        </div>
      )}
    </div>
  );
};

export default FileUploadStep;
