// import { LoadingButton } from '@mui/lab';
import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';
import { useDataProvider, useGetList, useRecordContext } from 'react-admin';
import { useMutation } from 'react-query';
import { DataProvider } from '../dataProvider';

interface MigrateDialogProps {
  open: boolean;
  onClose: () => void;
}

export const MigrateDialog = ({ open, onClose }: MigrateDialogProps) => {
  const record = useRecordContext();
  const [loading, setLoading] = useState(false);
  const { data } = useGetList('models', {
    pagination: { page: 1, perPage: 1000 },
    filter: {
      type: record.model.type,
    },
    sort: { field: 'published_at', order: 'DESC' },
  });
  const dataProvider = useDataProvider<DataProvider>();
  const { mutateAsync } = useMutation({
    mutationFn: ({
      projectId,
      modelId,
    }: {
      projectId: string;
      modelId: string;
    }) => dataProvider.migrateProject(projectId, modelId),
  });

  const handleClose = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    setLoading(true);

    const model = (event.target as any).model.value;

    const result = await mutateAsync({
      projectId: record.id.toString(),
      modelId: model,
    });

    setLoading(false);
    window.open(
      `${import.meta.env.VITE_FRONT_URL}/project/${result.json._id}`,
      '_blank',
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Migration projet "{record.name}"</DialogTitle>
        <DialogContent
          dividers={true}
          sx={{ gap: '16px', display: 'flex', flexDirection: 'column' }}
        >
          <InputLabel>Migrer vers le modèle</InputLabel>
          <select name="model">
            {data
              ?.sort((a: any, b: any) => b.versionNumber - a.versionNumber)
              .map((model: any) => (
                <option value={model.id}>
                  [{model.status}] {model.name} {model.versionNumber} (
                  {new Date(model.createdAt).toLocaleDateString()})
                </option>
              ))}
          </select>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={loading}
            type="submit"
            color="primary"
            variant="contained"
            fullWidth
          >
            Migrer le projet
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};
