import styled from '@emotion/styled';
import {Box, Button, Table, CircularProgress} from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { QuestionBankList } from './QuestionBankList';
import { CreateQuestionBankDialog } from './CreateQuestionBankDialogBox';
import QuestionManagement from './QuestionManagement';
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
export const QuestionBank = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { folderId } = useParams();
  const [data, setData] = useState([]);
  const [questionData , setQuestionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);

const fetchData = async (filters = {}) => {
  console.log(filters);

  // Determine if filters are applied
  const hasFilters = Object.values({
    searchText: filters.searchText?.trim(),
    filterPreviousYears: filters.filterPreviousYears,
    filterResource: filters.filterResource?.trim(),
    filterNegativeMarking: filters.filterNegativeMarking,
    filterDifficulty: filters.filterDifficulty?.trim(),
  }).some(value => value !== undefined && value !== '');

  // Only set loading true if no filters are applied
  if (!hasFilters) {
    setLoading(true);
  }

  try {
    let url;
    if (folderId) {
      url = `${BASE_URL}/api/admin/question-bank?parentId=${folderId}`;
    } else {
      url = `${BASE_URL}/api/admin/question-bank`;
    }

    const queryParams = new URLSearchParams();
    if (folderId) queryParams.append('parentId', folderId);
    if (filters.searchText?.trim()) queryParams.append('searchText', filters.searchText.trim());
    if (filters.filterPreviousYears !== undefined && filters.filterPreviousYears !== '') {
      queryParams.append('previousYears', filters.filterPreviousYears);
    }
    if (filters.filterResource?.trim()) queryParams.append('resource', filters.filterResource.trim());
    if (filters.filterNegativeMarking !== undefined && filters.filterNegativeMarking !== '') {
      queryParams.append('negativeMarking', filters.filterNegativeMarking);
    }
    if (filters.filterDifficulty?.trim()) queryParams.append('difficulty', filters.filterDifficulty.trim());

    const finalUrl = queryParams.toString()
      ? `${BASE_URL}/api/admin/question-bank?${queryParams.toString()}`
      : url;

    const res = await axios.get(finalUrl);

    if (res.status === 200 && res.data && Array.isArray(res.data.questionBanks)) {
      setData(res.data.questionBanks);
      setQuestionData(res.data.questions);
    } else {
      setData([]);
      setQuestionData([]);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load content. Please try again.',
      confirmButtonColor: '#d33',
    });
    setData([]);
    setQuestionData([]);
  } finally {
    setLoading(false);
  }
};

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDialogSuccess = () => {
    fetchData();
  };
  const handleEdit = (folder) => {
    setOpenDialog(true);
    setEditData(folder);
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
        const res = await axios.delete(`${BASE_URL}/api/question-bank/${folder._id}`);
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
            Create New Question Bank
          </StyledButton>
        </Box>
        <Box>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
            <QuestionBankList
           folders={data}
           onEdit={handleEdit}
           onDelete={handleDeleteFolder}
           />
          {folderId && (
             <Box>
               <QuestionManagement data = {questionData} fetchData={fetchData} />
            </Box>
          ) }
            </>
          )}
        </Box>
      </SimpleCard>
     {openDialog && (
         <CreateQuestionBankDialog
        open={openDialog}
        editData = {editData}
        onClose={handleCloseDialog}
        onSuccess={handleDialogSuccess}
        folderId={folderId}
      />
     )}
    </Container>
  );
};