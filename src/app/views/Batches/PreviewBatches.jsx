import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Checkbox, 
  IconButton, 
  Grid, 
  Divider,
  InputAdornment,
  Chip,
  Stack,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { styled } from '@mui/system';
import { Breadcrumb, SimpleCard } from 'app/components';
import { BASE_URL } from 'app/config/config';
import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const Container = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" },
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

const StudentTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const PreviewBatch = () => {
  const [loading, setLoading] = useState(false);
  const { batchId } = useParams();
  const [batch, setBatch] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0 for Students, 1 for Tests
  const [filteredTests, setFilteredTests] = useState([]);

  const fetchBatchById = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/batch/${batchId}`);
      if (res.status === 200) {
        setBatch(res.data.batch);
        setFilteredStudents(res.data.batch.students || []);
        setFilteredTests(res.data.batch.test || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load batch data. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchById();
  }, [batchId]);

  useEffect(() => {
    if (batch) {
      // Filter students
      if (batch.students) {
        const filteredStudentData = batch.students.filter(student =>
          student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filteredStudentData);
      }
      
      // Filter tests
      if (batch.test) {
        const filteredTestData = batch.test.filter(test =>
          test.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.date?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTests(filteredTestData);
      }
    }
  }, [searchQuery, batch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery(''); // Clear search when switching tabs
    setSelectedStudents([]); // Clear selections when switching tabs
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.studentId || student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleRemoveStudent = async (studentId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this student from the batch?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove!'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/batch/${batchId}/student/${studentId}`);
        if(res.status === 200){
          Swal.fire({
            icon: 'success',
            title: 'Removed!',
            text: 'Student has been removed from the batch.',
            confirmButtonColor: '#3085d6'
          });
          fetchBatchById();
        }
      } catch (error) {
        console.error('Error removing student:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to remove student.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedStudents.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Selection',
        text: 'Please select students to remove.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to remove ${selectedStudents.length} selected student(s) from the batch?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/batch/${batchId}/students`, { 
          data: { studentIds: selectedStudents } 
        });
        
        if (res.status === 200) {
          setSelectedStudents([]);
          Swal.fire({
            icon: 'success',
            title: 'Removed!',
            text: 'Selected students have been removed from the batch.',
            confirmButtonColor: '#3085d6'
          });
          fetchBatchById(); // Refresh the data
        }
      } catch (error) {
        console.error('Error removing students:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to remove students. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration;
  };

  const formatTestDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Convert DD-MM-YYYY to a proper date format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  // Helper function to render multiple items as chips
  const renderMultipleItems = (items, field) => {
    if (!items || items.length === 0) return <Typography color="textSecondary">None</Typography>;
    
    return (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {items.map((item, index) => (
          <Chip
            key={item._id || index}
            label={item[field]}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.75rem', mb: 0.5 }}
          />
        ))}
      </Stack>
    );
  };

  const getStatusDisplay = (startDate, isActive) => {
    if (!isActive) return 'INACTIVE';
    
    const now = new Date();
    const start = new Date(startDate);
    
    if (now < start) return 'UPCOMING';
    return 'ACTIVE';
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  if (!batch) {
    return (
      <Container>
        <Typography>No batch data found.</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Batches", path: "/batch" }, { name: "Preview" }]} />
      </Box>

      {/* Batch Information Card */}
      <InfoCard>
        <CardContent>
          <Typography variant="h4" gutterBottom color="primary" fontWeight="bold">
            {batch.title}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Batch Code</Typography>
              <Typography variant="body1" fontWeight="600" fontSize={"15px"}>
                {batch.batchCode}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Subjects</Typography>
              <Box mt={1}>
                {renderMultipleItems(batch.subject, 'subject')}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Courses</Typography>
              <Box mt={1}>
                {renderMultipleItems(batch.course, 'course')}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Tests</Typography>
              <Box mt={1}>
                {batch.test && batch.test.length > 0 ? 
                  renderMultipleItems(batch.test, 'name') : 
                  <Typography color="textSecondary" fontSize="14px">No tests assigned</Typography>
                }
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="body1" fontWeight="600" textTransform="capitalize" fontSize={"15px"}>
                {getStatusDisplay(batch.startingDate, batch.isActive)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Starting Date</Typography>
              <Typography variant="body1" fontWeight="600" fontSize={"15px"}>
                {formatDate(batch.startingDate)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Current Enrollment</Typography>
              <Typography variant="body1" fontWeight="600" fontSize={"15px"}>
                {batch.currentEnrollment || 0} student{(batch.currentEnrollment || 0) !== 1 ? 's' : ''}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Fees</Typography>
              <Typography variant="body1" fontWeight="600" fontSize={"15px"}>
                {batch.fees.amount === 0 ? 'Free' : `₹${batch.fees.amount.toLocaleString('en-IN')}`}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle2" color="textSecondary">Created By</Typography>
              <Typography variant="body1" fontWeight="600" fontSize={"15px"} textTransform="capitalize">
                {batch.createdBy}
              </Typography>
            </Grid>
            
            {batch.description && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography variant="body1" mt={1}>{batch.description}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </InfoCard>

      <Divider />

      {/* Students and Tests Section with Tabs */}
      <Box mt={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="batch tabs">
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Students
                  <Badge badgeContent={filteredStudents.length} color="primary" />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Tests
                  <Badge badgeContent={filteredTests.length} color="secondary" />
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Students Tab Panel */}
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Students ({filteredStudents.length})
            </Typography>
            
            {selectedStudents.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleRemoveSelected}
              >
                Remove Selected ({selectedStudents.length})
              </Button>
            )}
          </Box>

          {/* Search Bar for Students */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Students Table */}
          <StudentTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length}
                      checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><Typography fontWeight="600">Name</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Email</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Enrollment Date</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Status</Typography></TableCell>
                  <TableCell align="center"><Typography fontWeight="600">Actions</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary" py={4}>
                        {searchQuery ? 'No students found matching your search.' : 'No students enrolled in this batch.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.studentId || student._id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudents.includes(student.studentId || student._id)}
                          onChange={() => handleSelectStudent(student.studentId || student._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="500">{student.name}</Typography>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={student.enrollmentStatus?.toUpperCase() || 'N/A'}
                          size="small"
                          color={
                            student.enrollmentStatus === 'enrolled' ? 'success' :
                            student.enrollmentStatus === 'completed' ? 'primary' :
                            student.enrollmentStatus === 'suspended' ? 'error' :
                            'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveStudent(student.studentId || student._id)}
                          size="small"
                          title="Remove Student"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StudentTableContainer>
        </TabPanel>

        {/* Tests Tab Panel */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Tests ({filteredTests.length})
            </Typography>
          </Box>

          {/* Search Bar for Tests */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tests by name or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Tests Table */}
          <StudentTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Typography fontWeight="600"  sx={{ ml: 2 }} >Test Name</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Date</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Duration</Typography></TableCell>
                  <TableCell><Typography fontWeight="600">Sections</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary" py={4}>
                        {searchQuery ? 'No tests found matching your search.' : 'No tests assigned to this batch.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map((test) => (
                    <TableRow key={test._id} hover>
                      <TableCell >
                        <Typography fontWeight="500" sx={{ ml: 2 }} component={Link}
                                                        to={`/editTest/${test._id}`}>{test.name}</Typography>
                      </TableCell>
                      
                      <TableCell>{formatTestDate(test.date)}</TableCell>
                      <TableCell>{formatDuration(test.duration)} Hrs.</TableCell>
                     
                      <TableCell>
                        <Typography variant="body2">
                          {test.sections?.length || 0} section{(test.sections?.length || 0) !== 1 ? 's' : ''}
                        </Typography>
                      </TableCell>
                     
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StudentTableContainer>
        </TabPanel>
      </Box>
    </Container>
  );
};