import { Dialog, DialogTitle } from '@mui/material';

import ReportActivities from './ReportActivities';

interface CreateReportModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: any;
}

export interface GeneralInfos {
  name: string;
  startDate: Date;
  endDate: Date;
}

const CreateReportModal = ({
  open,
  setOpen,
  onClose,
}: CreateReportModalProps) => {
  const handleClose = () => {
    onClose && onClose();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      id="create_modal"
      maxWidth={'lg'}
    >
      <DialogTitle
        id="scroll-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <div>
          <p className="h2b">Nouveau rapport</p>
        </div>
      </DialogTitle>
      <ReportActivities onCancel={handleClose} />
    </Dialog>
  );
};

export default CreateReportModal;
