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
import axios from 'axios';
import { BASE_URL } from 'app/config/config';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { SectionsManager } from './SectionsManager'; // Import the new component



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

export const EditTest = () => {
    const {fileId} = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/global-library/get-sections/${fileId}`);
            if(res.status === 200){
                setData(res.data.data);
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
    }

    useEffect(() => {
        fetchData();
    }, [fileId])

   return (
     <Container>
       <Box className="breadcrumb">
         <Breadcrumb routeSegments={[{ name: "Library" }]} />
       </Box>
       <SimpleCard title="Edit Test">
         <Divider sx={{ my: 2 }} />
         {!loading && data && (
           <SectionsManager
             data={data} 
             onDataUpdate={fetchData}
           />
         )}
         {loading && (
           <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
             Loading sections...
           </Box>
         )}
         <Box sx={{ overflowX: "auto" }}>
         </Box>
       </SimpleCard>
     </Container>
   );
};