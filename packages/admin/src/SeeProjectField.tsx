import { Button } from '@mui/material';
import { get } from 'lodash';
import {
  sanitizeFieldRestProps,
  UrlFieldProps,
  useRecordContext,
} from 'react-admin';

import PreviewIcon from '@mui/icons-material/Preview';

export const SeeProjectField = ({
  className,
  emptyText,
  source,
  ...rest
}: UrlFieldProps) => {
  const record = useRecordContext();
  if (!source) {
    return null;
  }
  const value = get(record, source);
  return (
    <Button
      variant="contained"
      startIcon={<PreviewIcon />}
      color="primary"
      href={`${process.env.REACT_APP_FRONT_URL}/project/${value}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
      size="small"
      target="_blank"
      {...sanitizeFieldRestProps(rest)}
      style={{ whiteSpace: 'nowrap' }}
    >
      SEEDS
    </Button>
  );
};
