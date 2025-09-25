import styled from '@emotion/styled';
import {Box, Button, Table,CircularProgress, Typography ,IconButton,TableHead,TableRow,TableCell,TableBody} from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Breadcrumb, SimpleCard } from 'app/components';
import { CreateCourseDialog } from './CreateCourse';

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


export const Course = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch Course from API
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/course`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching Course:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load Course. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  const handleOpenDialog = () => {
    setEditData(null);
    setDialogOpen(true);
  };
    const handleOpenDialogedit = (course = null) => {
    setEditData(course);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    fetchCourse(); // Refresh the list
  };

  const handleDelete = async (course) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the Course "${course.course}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/course/${course._id}`);
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Course has been deleted successfully.',
          confirmButtonColor: '#3085d6'
        });
        
        fetchCourse(); // Refresh the list
      } catch (error) {
        console.error('Error deleting Course:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete Course. Please try again.',
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
        <Typography variant="body2" sx={{ ml: 2 }}>Loading Course...</Typography>
      </Box>
    );
  }

  return (
      <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Course" }]} />
      </Box>
      <SimpleCard title="Course">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary"startIcon={<Add />} onClick={handleOpenDialog} disabled={loading} >
            Create New Course
          </StyledButton>
        </Box>
        <Box>
          {loading ? ( <CircularProgress />) : ( 
            <StyledTable>
      <TableHead>
       <TableRow>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Course</TableCell>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }} align='center'>Actions</TableCell>
</TableRow>
      </TableHead>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course._id}>
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {course.course}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialogedit(course)}
                      sx={{ mr: 1 }}
                      title="Edit Course"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(course)}
                      title="Delete Course"
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
      <CreateCourseDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </Container>
  );
};

export default Course;