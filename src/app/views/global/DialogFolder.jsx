import styled from '@emotion/styled';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { formatDate } from './FormatDate';
import { useEffect } from 'react';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '& .MuiTypography-root': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontWeight: 600,
  },
}));

export const DialogFolder = ({ fetchData, openDialog, handleCloseDialog , editFolderData }) => {
  const [folderName, setFolderName] = useState('');
  const [creationDate, setCreationDate] = useState(null);
  const isEditMode = Boolean(editFolderData);
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const { folderId } = useParams();
  const validateForm = () => {
    const newErrors = {};

    if (!folderName.trim()) {
      newErrors.folderName = 'Folder name is required';
    } else if (folderName.trim().length < 2) {
      newErrors.folderName = 'Folder name must be at least 2 characters';
    } else if (folderName.trim().length > 50) {
      newErrors.folderName = 'Folder name must be less than 50 characters';
    }

    if (!creationDate) {
      newErrors.creationDate = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    useEffect(() => {
      if (openDialog) {
        if (editFolderData) {
            setFolderName(editFolderData.name);
        } else {
          setFolderName("");
          setCreationDate(null);
          setErrors({});
      }
    }
    }, [openDialog, editFolderData]);

  const handleCreateFolder = async () => {
    if (!validateForm()) return;

    setCreating(true);
    try {

        let formattedDate;
          if (isEditMode) {
            const originalDate = new Date(editFolderData.date);
            const currentDate = new Date(creationDate);
            if (originalDate.toDateString() === currentDate.toDateString()) {
              formattedDate = editFolderData.date;
            } else {
              formattedDate = formatDate(creationDate);
            }
          } else {
            formattedDate = formatDate(creationDate);
          }
      const payload = {
        name: folderName.trim(),
        date: formattedDate,
        parentId : folderId? folderId : null
      };

      const response = isEditMode ? await axios.patch(`${BASE_URL}/api/global-library/folders/${editFolderData._id}`, payload) : await axios.post(`${BASE_URL}/api/global-library/add-new-folder`, payload);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: isEditMode ? 'Updated' : 'Created',
          text: `Folder ${isEditMode ? 'updated' : 'created'} successfully!`,
          confirmButtonColor: '#28a745',
        });

        await fetchData();
        handleCloseDialog();
        setFolderName("");
        setCreationDate(null)
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create folder. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !creating && folderName.trim() && creationDate) {
      handleCreateFolder();
    }
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <StyledDialogTitle>
        <Typography variant="h6" component="div">
          <FolderIcon />
           {isEditMode ? "Edit Folder" : "Create New Folder"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{ color: 'inherit' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Folder Name"
            type="text"
            fullWidth
            variant="outlined"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              if (errors.folderName) {
                setErrors((prev) => ({ ...prev, folderName: '' }));
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter folder name"
            helperText={errors.folderName || 'Enter a descriptive name for your new folder'}
            error={!!errors.folderName}
            required
            inputProps={{ maxLength: 50 }}
          />

          <Box mt={2}>
            <DatePicker
              label="Creation Date"
              value={creationDate}
              onChange={(newValue) => {
                setCreationDate(newValue);
                if (errors.creationDate) {
                  setErrors((prev) => ({ ...prev, creationDate: '' }));
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.creationDate,
                  helperText: errors.creationDate || 'Select the folder creation date',
                },
              }}
            />
            {editFolderData && editFolderData.date && <p>Previous Date : {editFolderData.date}</p>}
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleCloseDialog}
          color="inherit"
          variant="outlined"
          disabled={creating}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateFolder}
          color="secondary"
          variant="contained"
          disabled={!folderName.trim() || !creationDate || creating}
          startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
          sx={{ minWidth: 140 }}
        >
            {creating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Folder' : 'Create Folder')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
