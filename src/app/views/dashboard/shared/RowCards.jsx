import React from 'react';
import { Grid, Card, styled } from '@mui/material';
import ReactECharts from 'echarts-for-react';

// STYLED COMPONENTS
const ChartContainer = styled('div')(() => ({
  height: '400px',
  padding: '10px',
  objectFit: 'cover',
}));

const revenueData = [
  { month: 'January', revenue: 12000 },
  { month: 'February', revenue: 15000 },
  { month: 'March', revenue: 8000 },
  { month: 'April', revenue: 18000 },
  { month: 'May', revenue: 20000 },
  { month: 'June', revenue: 17000 },
  { month: 'July', revenue: 16000 },
  { month: 'August', revenue: 19000 },
  { month: 'September', revenue: 14000 },
  { month: 'October', revenue: 21000 },
  { month: 'November', revenue: 22000 },
  { month: 'December', revenue: 24000 },
];

const months = revenueData.map((item) => item.month);
const revenues = revenueData.map((item) => item.revenue);

const chartOptions = {
  title: {
    text: 'Monthly Revenue',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
    formatter: '{b0}: ${c0}',
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
    name: 'Revenue ($)',
    axisLabel: {
      formatter: '${value}',
    },
  },
  series: [
    {
      name: 'Revenue',
      data: revenues,
      type: 'line',
      itemStyle: {
        color: '#ff5722',
      },
      lineStyle: {
        color: '#ff5722',
      },
      label: {
        show: true,
        position: 'top',
        formatter: '${c}',
      },
    },
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
};

export default function StaticRevenueChart() {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12}>
        <Card elevation={3}>
          <ChartContainer>
            <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
          </ChartContainer>
        </Card>
      </Grid>
    </Grid>
  );
}