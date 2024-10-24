import { Button } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

export const CreateProjectField = () => {
  return (
    <Button
      startIcon={<AddIcon />}
      color="primary"
      href={`${process.env.REACT_APP_FRONT_URL}`}
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
