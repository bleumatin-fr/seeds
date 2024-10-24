import { Card, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useInput } from 'react-admin';

const FunctionErrorsStep = ({ source }: { source: string }) => {
  const { field } = useInput({
    source,
  });

  if (!field.value || !field.value.length) {
    return null;
  }
  return (
    <Card
      sx={{
        marginBottom: 2,
        padding: 2,
      }}
    >
      <Typography variant="h5" component="div">
        {field.value.length} erreurs non bloquantes
      </Typography>
      <Typography variant="body2">
        Ces erreurs ne bloquent pas l'importation, mais peuvent avoir un impact
        sur les calculs lorsque toutes les données du formulaire de ne sont pas
        renseignées.
      </Typography>
      {field.value.length > 0 && (
        <DataGrid
          rows={field.value.map((error: any, index: number) => ({
            id: index,
            ...error,
          }))}
          columns={[
            { field: 'address', headerName: 'Address', width: 200 },
            { field: 'message', headerName: 'Message', width: 200 },
            { field: 'type', headerName: 'Type', width: 200 },
            { field: 'value', headerName: 'Value', width: 200 },
          ]}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}
    </Card>
  );
};

export default FunctionErrorsStep;
