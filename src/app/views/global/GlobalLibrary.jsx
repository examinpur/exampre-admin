import styled from '@emotion/styled';
import { 
  Box, 
  Button, 
  Table,
  Divider
} from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import QuizIcon from '@mui/icons-material/Quiz';
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { DialogFolder } from './DialogFolder';
import { DialogFile } from './DialogFile';
import { FolderList } from './FolderList';
import { FileList } from './FileList';
import { useParams } from 'react-router-dom';

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

export const GlobalLibrary = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const { folderId } = useParams();
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [data, setData] = useState({});
  const [folders, setFolder] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editFileData,setEditFileData] = useState(null);
  const [editFolderData,setEditFolderData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url;
      if(folderId){
       url = `${BASE_URL}/api/global-library/get-all-data?parentId=${folderId}`;
      }else{
        url = `${BASE_URL}/api/global-library/get-all-data`
      }
      const res = await axios.get(url);
      if (res.status === 200) {
        setData(res.data.data);
        setFolder(res.data.data.children || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load folders. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditFolderData(null)
  };

  const handleOpenTestDialog = () => {
    setOpenTestDialog(true);
  };

  const handleCloseTestDialog = () => {
    setOpenTestDialog(false);
    setEditFileData(null)
  };

  const handleEditFolder = (folder) => {
    console.log('Edit folder:', folder);
    setOpenDialog(true);
    setEditFolderData(folder)
  };

  const handleDeleteFolder = async (folder) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the folder "${folder.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
      try {
       const res = await axios.delete(`${BASE_URL}/api/global-library/folders/${folder._id}`);
       if(res.status === 200){
         fetchData();
        Swal.fire('Deleted!', 'Folder has been deleted.', 'success');
       }
      } catch (error) {
        Swal.fire('Error!', error.response.data.message || 'Failed to delete folder.', 'error');
      }
    }
  };

  const handleEditFile = (file) => {
    console.log('Edit file:', file);
    setOpenTestDialog(true);
    setEditFileData(file)
  };

  const handleDeleteFile = async (file) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the test "${file.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/global-library/files/${file._id}`);
       if(res.status === 200){
         fetchData();
        Swal.fire('Deleted!', 'Test file has been deleted.', 'success');
       }
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete test file.', 'error');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [folderId]);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Library" }]} />
      </Box>

      <SimpleCard title="Global Library">
        <Box mb={2} ml="-10px">
          <StyledButton
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Create Folder
          </StyledButton>
          <StyledButton
            variant="contained"
            color="primary"
            startIcon={<QuizIcon />}
            onClick={handleOpenTestDialog}
            disabled={loading}
          >
            Create Test
          </StyledButton>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          {/* Folder List Component */}
          <FolderList 
            folders={folders}
            onEdit={handleEditFolder}
            onDelete={handleDeleteFolder}
          />
          
          {/* Divider between folders and files */}
          {folders.some(item => item.type === 'folder') && 
           folders.some(item => item.type === 'file') && (
            <Divider sx={{ my: 3 }} />
          )}
          
          {/* File List Component */}
          <FileList 
            folders={folders}
            onEdit={handleEditFile}
            onDelete={handleDeleteFile}
          />
        </Box>
      </SimpleCard>

      {openDialog && (
        <DialogFolder 
          fetchData={fetchData} 
          folders={folders} 
          openDialog={openDialog} 
          editFolderData = {editFolderData}
          handleCloseDialog={handleCloseDialog}
          
        />
      )}

      {openTestDialog && (
        <DialogFile 
          fetchData={fetchData} 
          openTestDialog={openTestDialog}
          editFileData = {editFileData}
          folders={folders} 
          handleCloseTestDialog={handleCloseTestDialog}
          
        />
      )}
    </Container>
  );
};