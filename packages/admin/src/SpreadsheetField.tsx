import { Button } from '@mui/material';
import { get } from 'lodash';
import {
  sanitizeFieldRestProps,
  UrlFieldProps,
  useRecordContext,
  useRedirect,
} from 'react-admin';

import OnlyOfficeIcon from './icons/OnlyOfficeIcon';

export const SpreadsheetField = ({
  className,
  emptyText,
  source,
  ...rest
}: UrlFieldProps) => {
  const redirect = useRedirect();
  const record = useRecordContext();

  if (!source) {
    return null;
  }
  const value = get(record, source);
  return (
    <Button
      variant="contained"
      startIcon={<OnlyOfficeIcon />}
      color="success"
      onClick={(e) => {
        e.stopPropagation();
        redirect('edit', 'spreadsheets', value);
      }}
      size="small"
      target="_blank"
      {...sanitizeFieldRestProps(rest)}
      style={{ whiteSpace: 'nowrap' }}
    >
      Spreadsheet
    </Button>
  );
};
