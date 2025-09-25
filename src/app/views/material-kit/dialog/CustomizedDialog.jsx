import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import MuiDialogContent from "@mui/material/DialogContent";
import MuiDialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Badge, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, styled, tableCellClasses } from "@mui/material";
import { useState } from "react";
import {
  Box,
  Avatar,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import React from "react";
import axios from "axios";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.white, 
    color: theme.palette.common.black,
    fontSize:16,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  
  borderRight: '1px solid',
  borderColor: theme.palette.divider, 
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.error.main, 
  '&:hover': {
    backgroundColor: theme.palette.error.dark, 
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  
}));

const DialogTitleRoot = styled(MuiDialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  "& .closeButton": {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
}));

const DialogTitle = (props) => {
  const { children, onClose } = props;
  return (
    <DialogTitleRoot disableTypography>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="Close" className="closeButton" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitleRoot>
  );
};

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  "&.root": { padding: theme.spacing(2) }
}));

const StyledButton1 = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: 'red', // Set button color to red
}));

const CelebrityBlockButton = ({
  celebrityId,
  isBlocked,
  updateCelebrityStatus,
}) => {
  const [loading, setLoading] = useState(false);

  const handleBlockCelebrity = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `https://alo-alou-5e7b1ef2c020.herokuapp.com/admin/celebrities/${celebrityId}`,
        { isBlocked: !isBlocked }
      );

      if (response.status === 200) {
        updateCelebrityStatus(celebrityId, response.data.isBlocked);

        if (response.data.isBlocked) {
         console.log("Celebrity blocked successfully.");
        } else {
          console.log("Celebrity unblocked successfully.");
        }
      }
    } catch (error) {
      console.log("An error occurred while updating the celebrity block status.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <StyledButton1
        variant="contained"
        onClick={handleBlockCelebrity}
        disabled={loading}
      >
        {isBlocked ? "Unblock Celebrity" : "Block Celebrity"}
      </StyledButton1>
    </Box>
  );
};
const CustomizedDialogs = ({onOpen,onClose,data,updateCelebrityStatus}) => {
  const [open, setOpen] = useState(onOpen);

  const handleClose = () =>{
    setOpen(false);
    onClose();
  };

  function createData(category, subCat) {
    return { category: category.length > 0 ? category : ['No category'], subCat: subCat.length > 0 ? subCat : ['No subcategory'] };
  }
  
  const rows = [
    createData(data.category || [], data.subCategory || []),
    createData(data.category2 || [], data.subCategory2 || []),
    createData(data.category3 || [], data.subCategory3 || []),
  ];

  return (
    <div>
     
      <Dialog  onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Celebrity Profile
        </DialogTitle>

        <DialogContent dividers>
          <Typography gutterBottom>
          <Paper  elevation={3} sx={{ overflow: 'hidden', borderRadius: '8px'}}>
        <Box sx={{ position: 'relative', height: { xs: 140, md: 260 } }}>
          <img
            src={'https://images.template.net/wp-content/uploads/2014/11/Natural-Facebook-Cover-Photo.jpg'}
            alt="profile cover"
            style={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              borderRadius: '8px 8px 0 0',
            }}
          />
        </Box>
        <Box sx={{ p: { xs: 2, md: 4 }, textAlign: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              mt: -15,
              p: 1,
              backgroundColor: 'background.paper',
              borderRadius: '50%',
            }}
          >
           <Badge
              color={data.isVerified ? 'secondary' : 'default'}
              badgeContent={data.isVerified ? '✔ Verified' : ''}
              sx={{
                '& .MuiBadge-dot': {
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                },
              }}
            >
              <Avatar
                src={data.picture}
                alt="profile"
                sx={{ width: { xs: 120, sm: 180 }, height: { xs: 120, sm: 180 } }}
              />
            </Badge>
            </Box>
            <Typography variant="h4" sx={{ mt: 2, textTransform: 'uppercase' }}>
               {data.name}
            </Typography>
    
            <Typography variant="body1" sx={{ backgroundColor: '#f0f0f0', }}>Birthday: {data.dob}</Typography>
            <Typography variant="body1" sx={{ backgroundColor: '#f0f0f0', }}>{data.email}</Typography>
        
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              mb: 4,
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h6" sx={{ color: data.followers.length === 0 ? 'red' : 'blue' }}>{data.followers.length}</Typography>
                <Typography variant="body2" color={'primary'}>Followers</Typography>
              </Grid>
              <Divider orientation="vertical" flexItem />
              <Grid item xs={3}>
                <Typography variant="h6">${data.price}</Typography>
                <Typography variant="body2" color={'primary'}>Price</Typography>
              </Grid>
              <Divider orientation="vertical" flexItem style={{marginLeft:"10px"}} />
              <Grid item xs={4}>
                <Typography variant="h6" sx={{ color: data.followers.length === 0 ? 'red' : 'blue' }}>{data.totalTransaction}</Typography>
                <Typography variant="body2" color={'primary'}>Total Transaction </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
            {/*  */}
            <TableContainer component={Paper}>
  <Table sx={{ minWidth: 700 }} aria-label="customized table">
    <TableHead>
      <TableRow>
        <StyledTableCell sx={{ paddingLeft: 4, paddingRight: 4 }}>Category</StyledTableCell>
        <StyledTableCell sx={{ paddingLeft: 4, paddingRight: 4 }} align="center">SubCategory</StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.category.length === 0 ? (
        <TableRow>
          <StyledTableCell colSpan={2} align="center" sx={{ padding: 2 }}>
            No category and subcategory
          </StyledTableCell>
        </TableRow>
      ) : (
        rows.map((row, rowIndex) => (
          <>
            {row.category.map((cat, catIndex) => (
              <StyledTableRow key={`${rowIndex}-${catIndex}`}>
                <StyledTableCell component="th" scope="row" sx={{ paddingLeft: 4, paddingRight: 4 }}>
                  {cat}
                </StyledTableCell>
                {row.subCat.length === 0 ? (
                  <StyledTableCell colSpan={1} align="center" sx={{ padding: 2 }}>
                    No subcategory
                  </StyledTableCell>
                ) : (
                  row.subCat.map((subcategory, subIndex) => (
                    <StyledTableCell sx={{ paddingLeft: 4, paddingRight: 4 }} key={`${rowIndex}-${catIndex}-${subIndex}`}>
                      {subcategory}
                    </StyledTableCell>
                  ))
                )}
              </StyledTableRow>
            ))}
          </>
        ))
      )}
    </TableBody>
  </Table>
</TableContainer>


          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">
            <CelebrityBlockButton
          celebrityId={data._id}
          isBlocked={data.isBlocked}
          updateCelebrityStatus={updateCelebrityStatus}
        />
        </Typography>
          </Box>
        </Box>
      </Paper>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomizedDialogs;
