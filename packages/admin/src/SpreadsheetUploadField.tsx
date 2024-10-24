import UploadIcon from '@mui/icons-material/Upload';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useState } from 'react';
import {
  sanitizeFieldRestProps,
  UrlFieldProps,
  useNotify,
  useRecordContext,
} from 'react-admin';
import FileUpload from 'react-mui-fileuploader';

const API_URL = process.env.REACT_APP_API_URL;

interface Error {
  address?: string;
  message?: string;
  type?: string;
  value?: string;
}

export const SpreadsheetUploadField = ({
  className,
  emptyText,
  ...rest
}: UrlFieldProps) => {
  const [open, setOpen] = useState(false);
  const [openConfigError, setOpenConfigError] = useState(false);
  const [openFunctionError, setOpenFunctionError] = useState(false);
  const [configErrors, setConfigErrors] = useState<string[]>([]);
  const [functionErrors, setFunctionErrors] = useState<Error[]>([]);
  const [fileToUpload, setFileToUpload] = useState<any>(null);
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const record = useRecordContext();

  const handleFileUploadError = (error: any) => {
    console.error(error);
  };

  const handleFilesChange = (files: any[]) => {
    setFileToUpload(files[0]);
  };

  const handleClose = (event: any) => {
    event.stopPropagation();
    setOpen(false);
  };

  const handleUpload = async (event: any) => {
    event.stopPropagation();
    setLoading(true);

    if (!fileToUpload) {
      return;
    }

    let formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch(`${API_URL}/spreadsheets/${record.type}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        const { functionErrors } = data;
        if (functionErrors.length > 0) {
          setOpenFunctionError(true);
          setFunctionErrors(functionErrors);
          notify(`File successfully uploaded, with errors`, {
            type: 'warning',
          });
        } else {
          notify(`File successfully uploaded`, { type: 'success' });
        }
      } else {
        notify(`Upload failed`, { type: 'error' });
        const { configErrors } = data;
        if (configErrors.length > 0) {
          setConfigErrors(configErrors);
          setOpenConfigError(true);
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

  return (
    <>
      <FunctionErrorModal
        open={openFunctionError}
        onClose={() => setOpenFunctionError(false)}
        errors={functionErrors}
      />
      <ConfigErrorModal
        open={openConfigError}
        onClose={() => setOpenConfigError(false)}
        errors={configErrors}
      />
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Replace current spreadsheet model file</DialogTitle>
        <Box sx={{ width: 500, padding: '16px' }}>
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
              sx: { p: 1 },
            }}
          />
          <LoadingButton
            loading={loading}
            variant="contained"
            fullWidth
            disabled={!fileToUpload}
            sx={{ marginTop: '16px' }}
            onClick={handleUpload}
          >
            Replace current spreadsheet
          </LoadingButton>
        </Box>
      </Dialog>

      <IconButton
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        size="small"
        target="_blank"
        {...sanitizeFieldRestProps(rest)}
        style={{ whiteSpace: 'nowrap' }}
        title="Replace current spreadsheet"
      >
        <UploadIcon />
      </IconButton>
    </>
  );
};

const getUniqueErrors = (errors: Error[]) => {
  let uniqueErrors: Error[] = [];
  errors.forEach((error) => {
    if (
      !uniqueErrors
        .map((uniqueError) => uniqueError.address)
        .includes(error.address)
    ) {
      uniqueErrors.push(error);
    }
  });
  return uniqueErrors;
};

const FunctionErrorModal = ({
  open,
  onClose,
  errors,
}: {
  open: boolean;
  onClose: () => void;
  errors: Error[];
}) => {
  const uniqueErrors = getUniqueErrors(errors);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Error Details</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Address</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueErrors.map(
                (error, index) =>
                  error.address && (
                    <TableRow key={index}>
                      <TableCell>{error.address}</TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>{error.type}</TableCell>
                      <TableCell>{error.value}</TableCell>
                    </TableRow>
                  ),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ConfigErrorModal = ({
  open,
  onClose,
  errors,
}: {
  open: boolean;
  onClose: () => void;
  errors: string[];
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Error Details</DialogTitle>
      <DialogContent>
        {errors.map((error) => (
          <p className="hxr">{error}</p>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
