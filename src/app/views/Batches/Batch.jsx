import styled from '@emotion/styled';
import {Box, Button, Table,CircularProgress} from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { BatchList } from './BatchList';
import { CreateBatches } from './CreateBatches';
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

export const Batch = () => {
   const [openDialog, setOpenDialog] = useState(false);
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [editBatchData, setEditBatchData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
     
       let url = `${BASE_URL}/api/admin/batch`;
    
      const res = await axios.get(url);
      if (res.status === 200 && res.data && Array.isArray(res.data)) {
        setData(res.data);
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
    setEditBatchData(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleEditBatch = (batch) => {
    setOpenDialog(true);
    setEditBatchData(batch);
  };

  const handleDeleteBatch = async (batch) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the Batch "${batch.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/batch/${batch._id}`);
        if (res.status === 200) {
          fetchData();
          Swal.fire('Deleted!', 'Batch has been deleted.', 'success');
        }
      } catch (error) {
        Swal.fire('Error!', error.response.data.message || 'Failed to delete Batch.', 'error');
      }
    }
  };

  const handleCreate = (payload ) =>{
    console.log(payload);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Batch" }]} />
      </Box>
      <SimpleCard title="Batch">
        <Box mb={2} ml="-10px">
          <StyledButton variant="contained" color="secondary"startIcon={<AddIcon />} onClick={handleOpenDialog} disabled={loading} >
            Create New Batch
          </StyledButton>
        </Box>
        <Box>
          {loading ? ( <CircularProgress />) : ( <BatchList data  = {data} onEdit = {handleEditBatch} onDelete = {handleDeleteBatch} loading = {loading} /> )}
        </Box>
      </SimpleCard>
    {openDialog && (  <CreateBatches
        open = {openDialog}
        onClose = {handleCloseDialog}
        onSuccess = {fetchData}
        editData = {editBatchData}
      />)}
    </Container>
  );
};