import React, { useState } from 'react';
import {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { StyledTable } from './GlobalLibrary'; 
import { Link, useNavigate } from 'react-router-dom';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BASE_URL } from 'app/config/config';

export const FileList = ({ folders, onEdit, onDelete }) => {
  const fileData = folders.filter(item => item.type === 'file');
  const navigate = useNavigate();
  const [test,setTest] = useState([])
  if (fileData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No files available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first test file to get started
        </Typography>
      </Box>
    );
  }

  const fetchTest = async (id) =>{
    try {
      const res = await axios.get(`${BASE_URL}/api/global-library/sections-with-questions/${id}`);
      if(res.status === 200){
        setTest(res.data.data);
      }
    } catch (error) {
      Swal.fire('Error!', error.response.data.message || 'Failed to get test.', 'error');
    }
  }
  

  const handleDoc = async (id) => {
    navigate(`/preview/${id}`)
    
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <DescriptionIcon sx={{ mr: 1 }} />
        Test Files ({fileData.length})
      </Typography>
      
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fileData.map((file) => (
            <TableRow key={file._id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="body2" fontWeight="medium" component={Link}
                                to={`/editTest/${file._id}`}>
                    {file.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {file.date}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {file.duration || 'N/A'}Hrs
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="center">
                <IconButton 
                  size="small" 
                  onClick={() => onEdit && onEdit(file)}
                  color="primary"
                  title="Edit File"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => onDelete && onDelete(file)}
                  color="error"
                  title="Delete File"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDoc && handleDoc(file._id)}
                  color="primary"
                  title="Download File"
                >
                  <VerticalAlignBottomIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </Box>
  );
};