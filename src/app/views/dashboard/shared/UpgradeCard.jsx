import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Grid, Card, styled, Box, Typography } from '@mui/material';

const ChartContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  borderRadius: '8px',
  boxShadow: theme.shadows[3],
}));

const StyledCalendar = styled(Calendar)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  boxShadow: theme.shadows[3],
  border: 'none',
  
}));

const DigitalClock = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  marginTop: '20px',
  color: theme.palette.text.primary,
}));

const CalendarClock = ({ height = '500px' }) => {
  const theme = useTheme();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleDateChange = (date) => {
    setDate(date);
  };

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <ChartContainer theme={theme} height={height}>
            <StyledCalendar onChange={handleDateChange} value={date} />
            <DigitalClock theme={theme}>
            {time.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}
            </DigitalClock>
          </ChartContainer>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CalendarClock;