import { IconButton } from '@mui/material';
import {
  sanitizeFieldRestProps,
  UrlFieldProps,
  useRecordContext,
} from 'react-admin';

import DownloadIcon from '@mui/icons-material/Download';

const API_URL = process.env.REACT_APP_API_URL;

export const SpreadsheetDownloadField = ({
  className,
  emptyText,
  source = 'type',
  ...rest
}: UrlFieldProps) => {
  const record = useRecordContext();

  return (
    <IconButton
      variant="contained"
      href={`${API_URL}/spreadsheets/${record[source]}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
      size="small"
      target="_blank"
      {...sanitizeFieldRestProps(rest)}
      style={{ whiteSpace: 'nowrap' }}
      title='Download current spreadsheet'
    >
      <DownloadIcon />
    </IconButton>
  );
};
