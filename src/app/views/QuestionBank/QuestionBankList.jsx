import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Science,
//   Chemistry,
  Calculate,
  Biotech,
  MoreVert,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const QuestionBankList = ({ folders, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);

  // Helper function to get subject name from nested object or string
  const getSubjectName = (subject) => {
    if (typeof subject === 'object' && subject?.subject) {
      return subject.subject;
    }
    return subject || 'N/A';
  };

  // Helper function to get chapter name from nested object or string
  const getChapterName = (chapterName) => {
    if (typeof chapterName === 'object' && chapterName?.chapterName) {
      return chapterName.chapterName;
    }
    return chapterName || 'N/A';
  };

  // Helper function to get topic name from nested object or string
  const getTopicName = (topic) => {
    if (typeof topic === 'object' && topic?.topic) {
      return topic.topic;
    }
    return topic || 'N/A';
  };

  // Subject icons mapping
  const getSubjectIcon = (subject) => {
    const subjectName = getSubjectName(subject);
    const iconProps = { fontSize: 'large', color: 'primary' };
    switch (subjectName?.toLowerCase()) {
      case 'physics':
        return <Science {...iconProps} />;
      case 'chemistry':
        return <Science {...iconProps} />;
      case 'mathematics':
        return <Calculate {...iconProps} />;
      case 'biology':
        return <Biotech {...iconProps} />;
      default:
        return <Science {...iconProps} />;
    }
  };

  // Level color mapping
  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'difficult':
        return 'error';
      default:
        return 'default';
    }
  };

  // Subject color mapping
  const getSubjectColor = (subject) => {
    const subjectName = getSubjectName(subject);
    switch (subjectName?.toLowerCase()) {
      case 'physics':
        return 'primary';
      case 'chemistry':
        return 'secondary';
      case 'mathematics':
        return 'info';
      case 'biology':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleMenuOpen = (event, bank) => {
    setAnchorEl(event.currentTarget);
    setSelectedBank(bank);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBank(null);
  };

  const handleEdit = (bank) => {
    onEdit && onEdit(bank);
    handleMenuClose();
  };

  const handleDelete = (bank) => {
    onDelete && onDelete(bank);
    handleMenuClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!folders || folders.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No question banks found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first question bank to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {folders.map((bank) => (
          <Grid item xs={12} md={6} lg={4} key={bank._id}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getSubjectIcon(bank.subject)}
                    <Chip 
                      label={getSubjectName(bank.subject)}
                      color={getSubjectColor(bank.subject)}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, bank)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography 
                  variant="h6" 
                  gutterBottom 
                  component={Link}
                  to={`/question-bank/${bank._id}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {bank.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, minHeight: '40px' }}
                >
                  {bank.description || 'No description available'}
                </Typography>

                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ space: 2 }}>
                  {/* Chapter Name */}
                  {bank.chapterName && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Chapter:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {getChapterName(bank.chapterName)}
                      </Typography>
                    </Box>
                  )}

                  {/* Topic */}
                  {bank.topic && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Topic:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {getTopicName(bank.topic)}
                      </Typography>
                    </Box>
                  )}

                  {/* Level */}
                  {bank.level && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Level:
                      </Typography>
                      <Chip 
                        label={bank.level.charAt(0).toUpperCase() + bank.level.slice(1)}
                        color={getLevelColor(bank.level)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                  {bank.levels !== undefined && bank.levels !== bank.level && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Levels:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {bank.levels}
                      </Typography>
                    </Box>
                  )}

                  {/* Created By */}
                  {bank.createdBy && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Created By:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                        {bank.createdBy}
                      </Typography>
                    </Box>
                  )}

                  {/* Created Date */}
                  {bank.createdAt && (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Created:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(bank.createdAt)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(selectedBank)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedBank)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};