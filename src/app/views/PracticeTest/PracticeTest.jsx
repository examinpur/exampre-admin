import styled from '@emotion/styled';
import {
  Box,
  Button,
  Table,
  Divider,
  CircularProgress
} from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { QuestionBankFolderList } from './PracticeTestFolder';
import CreateQuestionBankDialog from './CreatePracticeTestDialog';

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
    "& tr": {
      "& th": {
        paddingLeft: 0,
        paddingRight: 0,
        fontWeight: 600,
        backgroundColor: theme.palette.grey[50],
        [theme.breakpoints.down("sm")]: {
          fontSize: "0.7rem",
        },
      },
    },
  },
  "& tbody": {
    "& tr": {
      "& td": {
        paddingLeft: 0,
        textTransform: "capitalize",
        [theme.breakpoints.down("sm")]: {
          fontSize: "0.7rem",
          padding: "8px 4px",
        },
      },
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  },
}));

export const Practice = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { folderId } = useParams();
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editFileData, setEditFileData] = useState(null);
  const [editFolderData, setEditFolderData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url;
      if (folderId) {
        url = `${BASE_URL}/api/practice-test?parentId=${folderId}`;
      } else {
        url = `${BASE_URL}/api/practice-test`;
      }
      const res = await axios.get(url);
      if (res.status === 200 && res.data && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load content. Please try again.',
        confirmButtonColor: '#d33'
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditFolderData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDialogSuccess = () => {
    fetchData();
  };

  const handleOpenTestDialog = () => {
    setOpenTestDialog(true);
    setEditFileData(null);
  };

  const handleEditFolder = (folder) => {
    setOpenTestDialog(true);
    setEditFileData(folder);
  };

  const handleDeleteFolder = async (folder) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the test "${folder.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/practice-test/${folder._id}`);
        if (res.status === 200) {
          fetchData();
          Swal.fire('Deleted!', 'Test has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error!', error.response.data.message || 'Failed to delete test.', 'error');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [folderId]);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Practice Test" }]} />
      </Box>

      <SimpleCard title="Test">
        <Box mb={2} ml="-10px">
          <StyledButton
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Create New Test
          </StyledButton>
        </Box>

        <Box>
          {loading ? (
            <CircularProgress />
          ) : (
            <QuestionBankFolderList
              folders={data}
              onEdit={handleEditFolder}
              onDelete={handleDeleteFolder}
            />
          )}
        </Box>
      </SimpleCard>
      <CreateQuestionBankDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSuccess={handleDialogSuccess}
      />
    </Container>
  );
};