import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export const CreateProjectField = () => {
  return (
    <Button
      startIcon={<AddIcon />}
      color="primary"
      href={`${import.meta.env.VITE_FRONT_URL}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
      size="small"
      target="_blank"
    >
      Create
    </Button>
  );
};
