import React, { useState, Fragment } from "react";
import { Icon, IconButton, styled } from "@mui/material";

import { topBarHeight } from "app/utils/constant";

// STYLED COMPONENTS
const SearchContainer = styled("div")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 9,
  width: "100%",
  display: "flex",
  alignItems: "center",
  height: topBarHeight,
  background: theme.palette.primary.main,
  color: theme.palette.text.primary,
  "&::placeholder": {
    color: theme.palette.text.primary
  }
}));
const SearchInput = styled("input")(({ theme }) => ({
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  paddingLeft: "20px",
  height: "calc(100% - 5px)",
  // Change background to specific red color
  background: theme.palette.primary.main,
  color: "#ffffff",
  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.8)",
    opacity: 1,
    "-webkit-text-fill-color": "rgba(255, 255, 255, 0.8)",
  },
  // Update autofill to use the new background color
  "&:-webkit-autofill": {
    "-webkit-text-fill-color": "#ffffff",
    "-webkit-box-shadow": "0 0 0 100px #8f1814 inset",
    transition: "background-color 5000s ease-in-out 0s",
  },
  "&:focus": {
    color: "#ffffff",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.6)",
    },
  },
  "&:disabled": {
    color: "rgba(255, 255, 255, 0.5)",
  }
}));

export default function MatxSearchBox({ setSearch, handleSearch , fetchData = () => {} }) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const toggle = () => {
    setSearchText('');
    setOpen(!open);
    setSearch(!open);
    if(open){
      fetchData();
    }
  };

  const handleSearchFunction = (e) => {
    const text = e.target.value;
    setSearchText(text);
    handleSearch(text);
  };

  

  return (
    <Fragment>
      {!open && (
        <IconButton onClick={toggle}>
          <Icon sx={{ color: "text.primary" }}>search</Icon>
        </IconButton>
      )}

      {open && (
        <SearchContainer
        //  sx={{ backgroundColor:"#8f1814"}}
        >
          <SearchInput
            type="text"
            placeholder="Search here..."
            autoFocus
            value={searchText}
            onChange={handleSearchFunction}
          />
          <IconButton onClick={toggle} sx={{ mx: 2, verticalAlign: "middle"  }}>
            <Icon sx={{ color: "white" }}>close</Icon>
          </IconButton>
        </SearchContainer>
      )}
    </Fragment>
  );
}
