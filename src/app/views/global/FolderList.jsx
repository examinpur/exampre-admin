import React, { useState } from 'react';
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';

export const FolderList = ({ folders, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  const folderData = folders.filter(item => item.type === 'folder');

  const handleMenuOpen = (event, folder) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFolder(null);
  };

  const handleEdit = () => {
    if (onEdit && selectedFolder) {
      onEdit(selectedFolder);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete && selectedFolder) {
      onDelete(selectedFolder);
    }
    handleMenuClose();
  };

  if (folderData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No folders available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first folder to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <FolderIcon sx={{ mr: 1 }} />
        Folders ({folderData.length})
      </Typography>

      <Grid container spacing={2}>
        {folderData.map((folder) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={folder._id}>
            <Card 
              sx={{ 
                position: 'relative',
                height: '120px',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
              component={Link}
              to={`/global-library/${folder._id}`}
            >
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, folder)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                padding: '16px',
              }}>
                {/* Folder Icon */}
                <FolderIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: '#1976d2',
                    mb: 1.5,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} 
                />

                {/* Folder Name */}
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600"
                  textAlign="center"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    color: '#1976d2',
                    fontSize: '1rem',
                  }}
                >
                  {folder.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit Folder</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Folder</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};