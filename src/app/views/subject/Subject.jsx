import styled from '@emotion/styled';
import {Box, Button, Table,CircularProgress, Typography, Fab , TableContainer,IconButton,Paper,TableHead,TableRow,TableCell,TableBody} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { CreateSubjectDialog } from './CreateSubject';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Breadcrumb, SimpleCard } from 'app/components';

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


export const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/subject`);
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load subjects. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenDialog = (subject = null) => {
    setEditData(null);
    setDialogOpen(true);
  };
    const handleOpenDialogedit = (subject = null) => {
    setEditData(subject);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    fetchSubjects(); // Refresh the list
  };

  const handleDelete = async (subject) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the subject "${subject.subject}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/subject/${subject._id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Subject has been deleted successfully.',
          confirmButtonColor: '#3085d6'
        });
        
        fetchSubjects(); // Refresh the list
      } catch (error) {
        console.error('Error deleting subject:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete subject. Please try again.',
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
        <Typography variant="body2" sx={{ ml: 2 }}>Loading subjects...</Typography>
      </Box>
    );
  }

  return (
      <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Subject" }]} />
      </Box>
      <SimpleCard title="Subjects">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary"startIcon={<Add />} onClick={handleOpenDialog} disabled={loading} >
            Create New Subject
          </StyledButton>
        </Box>
        <Box>
          {loading ? ( <CircularProgress />) : ( 
            <StyledTable>
      <TableHead>
       <TableRow>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Subject</TableCell>
  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Class</TableCell>

 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }} align='center'>Actions</TableCell>
</TableRow>
      </TableHead>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject._id}>
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {subject.subject}
                </Typography>
              </Box>
            </TableCell>
             <TableCell>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {subject.classId.class}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialogedit(subject)}
                      sx={{ mr: 1 }}
                      title="Edit Subject"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(subject)}
                      title="Delete Subject"
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
      <CreateSubjectDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </Container>
  );
};

export default Subject;