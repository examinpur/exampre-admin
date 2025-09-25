import React from 'react';
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledTable } from './Batch';
import { Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export const BatchList = ({ data, onEdit, onDelete, loading }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (startDate, isActive) => {
    if (!isActive) return 'default';
    
    const now = new Date();
    const start = new Date(startDate);
    
    if (now < start) return 'info'; // upcoming
    return 'success'; // active
  };

  const getStatusText = (startDate, isActive) => {
    if (!isActive) return 'Inactive';
    
    const now = new Date();
    const start = new Date(startDate);
    
    if (now < start) return 'Upcoming';
    return 'Active';
  };

  // Helper function to render multiple items as chips
  const renderMultipleItems = (items, field, maxDisplay = 2) => {
    if (!items || items.length === 0) return '-';
    
    const displayItems = items.slice(0, maxDisplay);
    const remainingCount = items.length - maxDisplay;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {displayItems.map((item, index) => (
          <Chip
            key={item._id || index}
            label={item[field]}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.75rem' }}
          />
        ))}
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount} more`}
            size="small"
            variant="outlined"
            color="default"
            sx={{ fontSize: '0.75rem' }}
          />
        )}
      </Box>
    );
  };

  // Helper function to render multiple items as text
  const renderMultipleItemsText = (items, field, maxDisplay = 2) => {
    if (!items || items.length === 0) return '-';
    
    const displayItems = items.slice(0, maxDisplay);
    const remainingCount = items.length - maxDisplay;
    
    const text = displayItems.map(item => item[field]).join(', ');
    
    return (
      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
        {text}
        {remainingCount > 0 && ` (+${remainingCount} more)`}
      </Typography>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Loading batches...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography variant="h6" color="textSecondary">
          No batches found
        </Typography>
      </Box>
    );
  }

  return (
    <StyledTable>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Title</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Subjects</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Courses</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Tests</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Start Date</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Enrolled</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Fees</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Status</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((batch) => (
          <TableRow key={batch._id}>
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {batch.title}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {batch.batchCode}
                </Typography>
              </Box>
            </TableCell>
            
            <TableCell sx={{ minWidth: 150 }}>
              {renderMultipleItems(batch.subject, 'subject')}
            </TableCell>
            
            <TableCell sx={{ minWidth: 150 }}>
              {renderMultipleItems(batch.course, 'course')}
            </TableCell>
            
            <TableCell sx={{ minWidth: 150 }}>
              {batch.test && batch.test.length > 0 ? (
                renderMultipleItems(batch.test, 'name')
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No tests
                </Typography>
              )}
            </TableCell>
            
            <TableCell>
              <Typography variant="subtitle2" fontWeight="500">
                {formatDate(batch.startingDate)}
              </Typography>
            </TableCell>
            
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight="500">
                  {batch.currentEnrollment || 0}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  student{(batch.currentEnrollment || 0) !== 1 ? 's' : ''}
                </Typography>
              </Box>
            </TableCell>
            
            <TableCell>
              {batch.fees.amount === 0 ? (
                <Chip label="Free" size="small" color="success" />
              ) : (
                <Typography variant="body2" fontWeight="500">
                  ₹{batch.fees.amount.toLocaleString('en-IN')}
                </Typography>
              )}
            </TableCell>
            
            <TableCell>
              <Chip
                label={getStatusText(batch.startingDate, batch.isActive)}
                size="small"
                color={getStatusColor(batch.startingDate, batch.isActive)}
              />
            </TableCell>
            
            <TableCell>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Link to={`/batch/${batch._id}`}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    title="View Details"
                  >
                    <Visibility fontSize="small" />  
                  </IconButton>
                </Link>
                <IconButton 
                  size="small" 
                  onClick={() => onEdit(batch)}
                  color="primary"
                  title="Edit Batch"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(batch)}
                  color="error"
                  title="Delete Batch"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};