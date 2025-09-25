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
  ListItemText,
  Chip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import { styled } from '@mui/system';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export const QuestionBankFolderList = ({ folders, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);

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

  if (!folders || folders.length === 0) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 3
      }}>
        <FolderIcon sx={{ 
          fontSize: 80, 
          color: 'text.disabled', 
          mb: 3,
          opacity: 0.5
        }} />
        <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
          No tests available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create your first test to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Container sx={{ mb: 4 }}>
     
      <Grid container spacing={3}  >
        {folders.map((folder) => (
          <Grid 
            item 
            key={folder._id}
          >
            <Card
              sx={{
                position: 'relative',
                height: '280px',
                width: '100%',
                minWidth: '280px', // Minimum width to ensure title visibility
                maxWidth: '320px', // Maximum width to prevent overly wide cards
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e0e0e0',
                  '& .more-button': {
                    opacity: 1,
                    transform: 'scale(1)',
                  }
                },
              }}
              component={Link}
              to={`/tests/${folder._id}`}
            >
              <IconButton
                className="more-button"
                size="small"
                onClick={(e) => handleMenuOpen(e, folder)}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 1,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  opacity: 0,
                  transform: 'scale(0.8)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>

              <CardContent sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}>
                {/* Header with Icon and Title */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <FolderIcon
                    sx={{
                      fontSize: 40,
                      color: 'primary.main',
                      mr: 1.5,
                      mt: 0.5,
                      flexShrink: 0 // Prevent icon from shrinking
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        mb: 1,
                        wordBreak: 'break-word', // Allow breaking long words
                        hyphens: 'auto', // Add hyphenation for better text flow
                        // Remove text overflow ellipsis to show full title
                        whiteSpace: 'normal',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, // Allow up to 2 lines for title
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      title={folder.title} // Add tooltip for full title on hover
                    >
                      {folder.title}
                    </Typography>
                    
                    {/* Price Chip */}
                   <Chip
  label={
    folder.isPaid ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CurrencyRupeeIcon sx={{ fontSize: '1rem' }} /> {/* smaller icon */}
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
          {folder.price}
        </Typography>
      </Box>
    ) : (
      'Free'
    )
  }
  size="medium"
  color={folder.isPaid ? 'primary' : 'success'}
  variant="outlined"
  sx={{ fontSize: '0.75rem' }}
/>

                  </Box>
                </Box>

                {/* Description */}
                {folder.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                      fontSize: '0.875rem'
                    }}
                  >
                    {folder.description}
                  </Typography>
                )}

                {/* Details */}
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Subject: </Box>
                      <Box component="span" sx={{ wordBreak: 'break-word' }}>{folder.subject}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Chapter: </Box>
                      <Box component="span" sx={{ wordBreak: 'break-word' }}>{folder.chapterName}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Topic: </Box>
                      <Box component="span" sx={{ wordBreak: 'break-word' }}>{folder.topic}</Box>
                    </Typography>
                    <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Level: </Box>
                      <Box component="span" sx={{ wordBreak: 'break-word' }}>{folder.level}</Box>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Edit Test</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Test</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};