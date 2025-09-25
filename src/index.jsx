import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import "perfect-scrollbar/css/perfect-scrollbar.css";
 



const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
  <LocalizationProvider dateAdapter={AdapterDateFns} >
    <App />
    </LocalizationProvider>
  </BrowserRouter>
);
serviceWorker.unregister();
