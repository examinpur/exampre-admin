import React, { useEffect, useState } from 'react';
import { Grid, Card, styled, CircularProgress, Box } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

// STYLED COMPONENTS
const ChartContainer = styled('div')(() => ({
  height: '400px',
  padding: '10px',
  objectFit: 'cover',
}));

const StatCards2 = () => {
  const [chartOptions, setChartOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://timesavor-server.onrender.com/api/admin/bookings/monthly-percentages');
        const { monthlyPercentages } = response.data;

        const months = monthlyPercentages.map((item) => item.monthYear);
        const percentages = monthlyPercentages.map((item) => parseFloat(item.percentage));

        setChartOptions({
          title: {
            text: 'Monthly Trips Planned by Users',
            left: 'center',
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
              rotate: 45,
              interval: 0,
            },
          },
          yAxis: {
            type: 'value',
            name: 'Percentage',
            axisLabel: {
              formatter: '{value}%',
            },
          },
          series: [
            {
              name: 'Trips',
              data: percentages,
              type: 'bar',
              itemStyle: {
                color: '#3f51b5',
              },
              label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
              },
            },
          ],
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
        });
      } catch (error) {
        console.error('Error fetching booking percentages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <ChartContainer>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
            )}
          </ChartContainer>
        </Card>
      </Grid>
    </Grid>
  );
};

export default StatCards2;