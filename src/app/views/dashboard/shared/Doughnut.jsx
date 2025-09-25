import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import ReactEcharts from "echarts-for-react";
// import { BASE_URL } from ""; 

const BASE_URL = "https://timesavor-server.onrender.com";

export default function DoughnutChart({ height, color = [] }) {
  const theme = useTheme();
  const [chartData, setChartData] = useState([
    { value: 50, name: "Users" },
    { value: 50, name: "Wineries" }
  ]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/getTotalCounts`)
      .then(response => {
        const { buyerPercentage, shopPercentage } = response.data;

        setChartData([
          { value: parseFloat(buyerPercentage), name: "Users" },
          { value: parseFloat(shopPercentage), name: "Wineries" }
        ]);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const option = {
    legend: {
      show: true,
      itemGap: 20,
      icon: "circle",
      bottom: 0,
      textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" }
    },
    tooltip: { show: true, trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
    xAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
    yAxis: [{ axisLine: { show: false }, splitLine: { show: false } }],
    series: [
      {
        name: "Total Counts",
        type: "pie",
        radius: ["45%", "72.55%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        hoverOffset: 5,
        stillShowZeroSum: false,
        label: {
          normal: {
            show: false,
            position: "center",
            textStyle: { color: theme.palette.text.secondary, fontSize: 13, fontFamily: "roboto" },
            formatter: "{a}"
          },
          emphasis: {
            show: true,
            textStyle: { fontSize: "14", fontWeight: "normal" },
            formatter: "{b} \n{c} ({d}%)"
          }
        },
        labelLine: { normal: { show: false } },
        data: chartData,
        itemStyle: {
          emphasis: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" }
        }
      }
    ]
  };

  return <ReactEcharts style={{ height: height }} option={{ ...option, color: [...color] }} />;
}
