import styled from '@emotion/styled';
import { Delete, Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import { BASE_URL } from 'app/config/config';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { CreateTopicDialog } from './CreateTopic';

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

export const Topic = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch topics from API
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/topic`);
      setTopics(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load topics. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleOpenDialog = (topic = null) => {
    setEditData(null);
    setDialogOpen(true);
  };

  const handleOpenDialogedit = (topic = null) => {
    setEditData(topic);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
  };

  const handleSuccess = () => {
    fetchTopics(); // Refresh the list
  };

  const handleDelete = async (topic) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the topic "${topic.topic}"? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/topic/${topic._id}`);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Topic has been deleted successfully.',
          confirmButtonColor: '#3085d6'
        });

        fetchTopics(); // Refresh the list
      } catch (error) {
        console.error('Error deleting topic:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete topic. Please try again.',
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
        <Typography variant="body2" sx={{ ml: 2 }}>Loading topics...</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Topic" }]} />
      </Box>
      <SimpleCard title="Topics">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenDialog} disabled={loading}>
            Create New Topic
          </StyledButton>
        </Box>
        <Box>
          {loading ? (<CircularProgress />) : (
            <StyledTable>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Topic</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Chapter</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Subject</TableCell>
                   <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }}>Class</TableCell>

                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em', color: '#666' }} align='center'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No topics found. Click the "Create New Topic" button to add your first topic.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  topics.map((topic) => (
                    <TableRow key={topic._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">
                            {topic.topic}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {topic.chapterId?.chapterName || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {topic.subjectId?.subject || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {topic?.subjectId?.classId?.class || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialogedit(topic)}
                          sx={{ mr: 1 }}
                          title="Edit Topic"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(topic)}
                          title="Delete Topic"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </StyledTable>
          )}
        </Box>
      </SimpleCard>
      <CreateTopicDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        editData={editData}
      />
    </Container>
  );
};