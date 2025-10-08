import styled from '@emotion/styled';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import { BASE_URL } from 'app/config/config';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { CreateChapterDialog } from './CreateChapterName';

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


export const ChapterName = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/chapter`);
      setChapters(response.data.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load chapters. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleOpenDialog = () => {
    setEditData(null);
    setDialogOpen(true);
  };
    const handleOpenDialogedit = (chapters = null) => {
    setEditData(chapters);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    fetchChapters(); // Refresh the list
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
        await axios.delete(`${BASE_URL}/api/chapter/${subject._id}`);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Chapter has been deleted successfully.',
          confirmButtonColor: '#3085d6'
        });

        fetchChapters(); // Refresh the list
      } catch (error) {
        console.error('Error deleting Chapter:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete chapter. Please try again.',
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
        <Typography variant="body2" sx={{ ml: 2 }}>Loading chapters...</Typography>
      </Box>
    );
  }

  return (
      <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Chapters" }]} />
      </Box>
      <SimpleCard title="Chapters">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary"startIcon={<Add />} onClick={handleOpenDialog} disabled={loading} >
            Create New Chapter
          </StyledButton>
        </Box>
        <Box>
          {loading ? ( <CircularProgress />) : (
            <StyledTable>
      <TableHead>
       <TableRow>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Chapters</TableCell>
  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Subject</TableCell>
     <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Class</TableCell>
 <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }} align='center'>Actions</TableCell>
</TableRow>
      </TableHead>
      <TableBody>
        {chapters.map((chapter) => (
          <TableRow key={chapter._id}>
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="600">
                  {chapter.chapterName}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>
              <Box>
               <Typography variant="body2" color="text.secondary">
                  {chapter.subjectId.subject}
                </Typography>
              </Box>
            </TableCell>
             <TableCell>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {chapter?.subjectId?.classId?.class}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialogedit(chapter)}
                      sx={{ mr: 1 }}
                      title="Edit Chapter"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(chapter)}
                      title="Delete Chapter"
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
      <CreateChapterDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </Container>
  );
};

