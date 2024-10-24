import { Card, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useInput } from 'react-admin';

const ConfigErrorsStep = ({ source }: { source: string }) => {
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
        {field.value.length} erreurs bloquantes
      </Typography>
      <Typography variant="body2">
        Les erreurs listées ici sont bloquantes : vous ne pouvez publier ce
        modèle en l'état. Corrigez les erreurs mentionnées et uploadez le
        nouveau fichier.
      </Typography>
      {field.value.length > 0 && (
        <DataGrid
          rows={field.value.map((error: any, index: number) => ({
            id: index,
            error,
          }))}
          columns={[{ field: 'error', headerName: 'Erreur', width: 600 }]}
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

export default ConfigErrorsStep;
