import { IconButton, Menu as MuiMenu, MenuItem } from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { MigrateDialog } from './MigrateDialog';
export const Menu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMigrationClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    handleClose();
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    handleClose();
  };

  return (
    <>
      <IconButton
        id="basic-button"
        aria-controls={menuOpen ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={menuOpen ? 'true' : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <MigrateDialog open={dialogOpen} onClose={handleDialogClose} />
      <MuiMenu
        id="basic-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleMigrationClick}>Migration test</MenuItem>
      </MuiMenu>
    </>
  );
};
