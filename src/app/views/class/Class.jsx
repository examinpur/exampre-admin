import styled from '@emotion/styled';
import {Box, Button, Table,CircularProgress, Typography, Fab , TableContainer,IconButton,Paper,TableHead,TableRow,TableCell,TableBody} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Breadcrumb, SimpleCard } from 'app/components';
import { CreateClassDialog } from './CreateClass';

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));
const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));
export const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: "nowrap",
  "& thead": {
    "& tr": { "& th": { paddingLeft: 0, paddingRight: 0,
        fontWeight: 600, backgroundColor: theme.palette.grey[50], [theme.breakpoints.down("sm")]: {fontSize: "0.7rem" }, },  },
  },
  "& tbody": { "& tr": { "& td": { paddingLeft: 0, textTransform: "capitalize", [theme.breakpoints.down("sm")]: {  fontSize: "0.7rem",
          padding: "8px 4px" } }, "&:hover": { backgroundColor: theme.palette.action.hover, },},
  },
}));


export const Class = () => {
  const [Classs, setClasss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch Classs from API
  const fetchClasss = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/class`);
      setClasss(response.data.data);
    } catch (error) {
      console.error('Error fetching Classs:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load Classs. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasss();
  }, []);

  const handleOpenDialog = (Class = null) => {
    setEditData(null);
    setDialogOpen(true);
  };
    const handleOpenDialogedit = (Class = null) => {
    setEditData(Class);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    fetchClasss(); // Refresh the list
  };

  const handleDelete = async (Class) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the Class "${Class.Class}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/class/${Class._id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Class has been deleted successfully.',
          confirmButtonColor: '#3085d6'
        });
        
        fetchClasss(); // Refresh the list
      } catch (error) {
        console.error('Error deleting Class:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete Class. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading Classs...</Typography>
      </Box>
    );
  }

  return (
      <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Class" }]} />
      </Box>
      <SimpleCard title="Classs">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary"startIcon={<Add />} onClick={handleOpenDialog} disabled={loading} >
            Create New Class
          </StyledButton>
        </Box>
        <Box>
          {loading ? ( <CircularProgress />) : ( 
            <StyledTable>
      <TableHead>
       <TableRow>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Class</TableCell>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }} align='center'>Actions</TableCell>
</TableRow>
      </TableHead>
      <TableBody>
        {Classs.map((Class) => (
          <TableRow key={Class._id}>
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {Class.class}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialogedit(Class)}
                      sx={{ mr: 1 }}
                      title="Edit Class"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(Class)}
                      title="Delete Class"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable> )}
        </Box>
      </SimpleCard>
     <CreateClassDialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            onSuccess={handleSuccess}
            editData={editData}
          />
    </Container>
  );
};

export default Class;