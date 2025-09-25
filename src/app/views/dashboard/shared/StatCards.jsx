import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Card, Grid, styled } from "@mui/material";
import { Group, Store } from "@mui/icons-material";
import { Small } from "app/components/Typography";
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  height: "100%",
  padding: "24px !important",
  background: theme.palette.background.paper,
  cursor: "pointer", // Add cursor pointer for cards
  [theme.breakpoints.down("sm")]: { padding: "16px !important" }
}));

const ContentBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  "& small": { color: theme.palette.text.secondary },
  "& .icon": { opacity: 0.6, fontSize: "44px", color: theme.palette.primary.main }
}));

const Heading = styled("h6")(({ theme }) => ({
  margin: 0,
  marginTop: "4px",
  fontSize: "20px",
  fontWeight: "500",
  color: theme.palette.primary.main
}));

export default function StatCards() {
  const [totalWineries, setTotalWineries] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchTotalWineriesAndUsers = async () => {
    try {
      const response = await axios.get("https://timesavor-server.onrender.com/api/admin/getTotalWineriesAndUsers");
      setTotalWineries(response.data.totalWineries);
      setTotalUsers(response.data.totalUsers);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    fetchTotalWineriesAndUsers();
  }, []);

  const cardList = [
    { name: "Total Wineries", amount: totalWineries, Icon: Store, path: '/winery' }, // Add path for navigation
    { name: "Total Users", amount: totalUsers, Icon: Group, path: '/users' } // Add path for navigation
  ];

  const handleCardClick = (path) => {
    navigate(path); // Use navigate to redirect
  };

  return (
    <Grid container spacing={3} sx={{ mb: "24px" }}>
      {cardList.map(({ amount, Icon, name, path }) => (
        <Grid item xs={12} sm={6} md={6} key={name}>
          <StyledCard elevation={6} onClick={() => handleCardClick(path)}> {/* Add onClick event */}
            <ContentBox>
              <Icon className="icon" />
              <Box mt={2}>
                <Small>{name}</Small>
                <Heading>{amount}</Heading>
              </Box>
            </ContentBox>
          </StyledCard>
        </Grid>
      ))}
    </Grid>
  );
}
