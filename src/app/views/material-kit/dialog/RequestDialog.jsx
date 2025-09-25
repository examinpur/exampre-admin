import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import MuiDialogContent from "@mui/material/DialogContent";
import MuiDialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Box, Avatar, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import styled from "@emotion/styled";

const DialogTitleRoot = styled(MuiDialogTitle)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  "& .closeButton": {
    color: theme.palette.grey[500],
  },
}));

const DialogTitle = (props) => {
  const { children, onClose } = props;
  return (
    <DialogTitleRoot disableTypography>
      <Typography variant="h6">{children}</Typography>
      <Box>
        {onClose ? (
          <IconButton aria-label="Close" className="closeButton" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </Box>
    </DialogTitleRoot>
  );
};

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  "&.root": { padding: theme.spacing(2) },
}));

export const RequestDialog = ({ onOpen, onClose, data, responseTime }) => {
  const [open, setOpen] = useState(onOpen);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Request Details
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ padding: 2, borderRadius: '8px', width: '100%', maxWidth: 600 }}>
              <Box sx={{ position: 'relative', height: { xs: 140, md: 260 } }}>
                <img
                  src={
                    "https://images.template.net/wp-content/uploads/2014/11/Natural-Facebook-Cover-Photo.jpg"
                  }
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
                  <Avatar
                    src={data.picture}
                    alt="profile"
                    sx={{ width: { xs: 120, sm: 180 }, height: { xs: 120, sm: 180 } }}
                  />
                </Box>
                <Typography variant="h4" sx={{ mt: 2, textTransform: 'uppercase' }}>
                  {data.Occasion}
                </Typography>
              </Box>
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Detail</Typography></TableCell>
                      <TableCell><Typography variant="subtitle1" fontWeight="bold">Information</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>{data.description}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Request Expiry</TableCell>
                      <TableCell>{formatDate(data.expireDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>{data.type}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>For Who</TableCell>
                      <TableCell>{data.forWho}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pronoun</TableCell>
                      <TableCell>{data.pronoun}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Request Date</TableCell>
                      <TableCell>{formatDate(data.requestDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Response Time</TableCell>
                      <TableCell>{responseTime}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Request Video</TableCell>
                      <TableCell>{data.requestVideo || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};
