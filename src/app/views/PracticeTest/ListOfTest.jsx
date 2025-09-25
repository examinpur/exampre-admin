import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link, useParams } from 'react-router-dom';
import { styled } from '@mui/system';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Breadcrumb, SimpleCard } from 'app/components';
import { BASE_URL } from 'app/config/config';

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

export const ListOfTests = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const { folderId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event, test) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTest(test);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTest(null);
  };

  const handleEdit = () => {
    if (selectedTest) {
      console.log('Edit test:', selectedTest);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedTest) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Delete test:', selectedTest);
        }
      });
    }
    handleMenuClose();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/practice-test/${folderId}`);
      if (res.status === 200 && res.data && Array.isArray(res.data.test)) {
        setData(res.data.test);
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

  useEffect(() => {
    fetchData();
  }, [folderId]);

  if (loading) {
    return (
      <Container>
        <Box className="breadcrumb">
          <Breadcrumb routeSegments={[{ name: "Question Bank" }]} />
        </Box>
        <SimpleCard title="Tests">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </SimpleCard>
      </Container>
    );
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Question Bank" }]} />
      </Box>

      <SimpleCard >
        <Box sx={{ mb: 4 }}>
          {data.length === 0 ? (
            // Empty state
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 3
            }}>
              <FolderIcon sx={{ 
                fontSize: 80, 
                color: 'text.disabled', 
                mb: 3,
                opacity: 0.5
              }} />
              <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                No tests available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first test to get started
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" sx={{ 
                mb: 4, 
                fontWeight: 700, 
                color: '#1a1a1a',
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <FolderIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                Tests ({data.length})
              </Typography>

              {/* Updated Grid container with better spacing and alignment */}
              <Grid container spacing={1} sx={{ justifyContent: 'flex-start' }}>
                {data.map((test) => (
                  <Grid 
                    item 
                    key={test._id}
                    sx={{
                      display: 'flex',
                      '&:first-of-type': {
                        // Ensure first item starts from the left
                        marginLeft: 0
                      }
                    }}
                  >
                    <Card
                      sx={{
                        position: 'relative',
                        height: '280px',
                        width: '100%',
                        minWidth: '280px', // Minimum width to ensure title visibility
                        maxWidth: '320px', // Maximum width to prevent overly wide cards
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '1px solid #f0f0f0',
                        backgroundColor: '#ffffff',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          backgroundColor: '#f8f9fa',
                          borderColor: '#e0e0e0',
                          '& .more-button': {
                            opacity: 1,
                            transform: 'scale(1)',
                          }
                        },
                      }}
                      component={Link}
                      to={`/editTest/${test._id}`}
                    >
                      <IconButton
                        className="more-button"
                        size="small"
                        onClick={(e) => handleMenuOpen(e, test)}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 1,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          opacity: 0,
                          transform: 'scale(0.8)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>

                      <CardContent sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}>
                        {/* Header with Icon and Title */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start',}}>
                          <FolderIcon
                            sx={{
                              fontSize: 40,
                              color: 'primary.main',
                              mr: 1.5,
                              flexShrink: 0 // Prevent icon from shrinking
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0, width: '100%' , alignItems : "center" }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: '#1a1a1a',
                                fontSize: '1.1rem',
                                // lineHeight: 1.3,
                               
                                wordBreak: 'break-word', // Allow breaking long words
                                hyphens: 'auto', // Add hyphenation for better text flow
                                // Remove text overflow ellipsis to show full title
                                whiteSpace: 'normal',
                                display: '-webkit-box',
                                WebkitLineClamp: 2, // Allow up to 2 lines for title
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                              title={test.name} // Add tooltip for full title on hover
                            >
                              {test.name}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Tags */}
                        {test.tag && test.tag.length > 0 && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                              fontSize: '0.875rem'
                            }}
                          >
                            {test.tag.join(', ')}
                          </Typography>
                        )}

                        {/* Details */}
                        <Box sx={{ mt: 'auto', pt: 1 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Date: </Box>
                              <Box component="span" sx={{ wordBreak: 'break-word' }}>{test.date}</Box>
                            </Typography>
                            <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Duration: </Box>
                              <Box component="span" sx={{ wordBreak: 'break-word' }}>{test.duration}</Box>
                            </Typography>
                            <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Type: </Box>
                              <Box component="span" sx={{ wordBreak: 'break-word', textTransform: 'capitalize' }}>{test.type}</Box>
                            </Typography>
                            <Typography variant="caption" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>Sections: </Box>
                              <Box component="span" sx={{ wordBreak: 'break-word' }}>{test.sections || 0}</Box>
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Context Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0'
                  }
                }}
              >
                <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <EditIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText>Edit Test</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete Test</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </SimpleCard>
    </Container>
  );
};