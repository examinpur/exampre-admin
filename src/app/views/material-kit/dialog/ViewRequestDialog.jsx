
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableRow, TableCell, Typography } from '@mui/material';

export const ViewRequestDialog = ({ onOpen, onClose, data, updateUserStatus }) => {
  if (!data) {
    return null;
  }

  return (
    <Dialog open={onOpen} onClose={onClose}>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th">Name</TableCell>
              <TableCell>{data.firstname} {data.lastname}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Email</TableCell>
              <TableCell>{data.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Username</TableCell>
              <TableCell>{data.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Provider</TableCell>
              <TableCell>{data.provider}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Bio</TableCell>
              <TableCell>{data.bio}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">City</TableCell>
              <TableCell>{data.city}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">State</TableCell>
              <TableCell>{data.state}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Date of Birth</TableCell>
              <TableCell>{data.dob}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Following</TableCell>
              <TableCell>{data.following}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th">Followers</TableCell>
              <TableCell>{data.followers}</TableCell>
            </TableRow>
            {/* Add more fields as needed */}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => updateUserStatus(data._id, !data.isBlocked)}>
          {data.isBlocked ? 'Unblock' : 'Block'}
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewRequestDialog;