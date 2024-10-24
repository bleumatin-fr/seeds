import { Button, Card, Typography } from '@mui/material';
import { useInput } from 'react-admin';
import { models } from './List';

const ModelSelector = ({ source }: { source: string }) => {
  const { field } = useInput({
    source,
  });

  const handleClick = (modelType: string) => () => {
    field.onChange(modelType);
  };

  return (
    <Card
      sx={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Typography variant="h5" component="div">
        Quel type de modèle souhaitez-vous créer ?
      </Typography>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {models.map((model) => (
          <Button
            key={model.id}
            onClick={handleClick(model.id)}
            variant={field.value === model.id ? 'contained' : 'outlined'}
            // color={field.value === model.id ? 'primary' : 'default'}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem',
            }}
          >
            {model.icon}
            <div>{model.name}</div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default ModelSelector;
