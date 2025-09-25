import { createContext, useEffect, useReducer } from "react";
import axios from "axios";
// CUSTOM COMPONENT
import { useNavigate } from "react-router-dom";
import { MatxLoading } from "app/components";
import Swal from "sweetalert2";
import { BASE_URL } from "app/config/config";

const initialState = {
  user: null,
  isInitialized: false,
  isAuthenticated: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT": {
      const { isAuthenticated, user } = action.payload;
      return { ...state, isAuthenticated, isInitialized: true, user };
    }

    case "LOGIN": {
      return { ...state, isAuthenticated: true, user: action.payload.updatedUser };
    }

    case "LOGOUT": {
      return { ...state, isAuthenticated: false, user: null };
    }

    case "REGISTER": {
      const { user } = action.payload;
      return { ...state, isAuthenticated: true, user };
    }

    default:
      return state;
  }
};

const AuthContext = createContext({
  ...initialState,
  method: "JWT",
  login: () => {},
  logout: () => {},
  register: () => {}
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate(); // Initialize useNavigate here

  const login = async (email, password) => {
    try {
         const res = await axios.post(`${BASE_URL}/api/admin/login`,{email,password});
         console.log(res);
        if(res.status === 200){
          const updatedUser = {
            token : res.data.token,
            name : res.data.admin.name
          }
        localStorage.setItem('examAdminToken', updatedUser);
        dispatch({ type: "LOGIN", payload: { updatedUser } });
        Swal.fire({
          title: "Success",
          text: "Login successfully.",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
        });
      }else{
        Swal.fire({
          icon:"error",
          text: "invalid credentials",
          confirmButtonText: "OK",
          confirmButtonColor: "#D63030FF",
        });
      }
     
    } catch (error) {
      let errorMessage = "An error occurred while logging in.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        title: "Error",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });
    }
  };
  

  const logout = () => {
    localStorage.removeItem('examAdminToken');
    dispatch({ type: "LOGOUT" });
    navigate('/session/signin');
  };

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('examAdminToken');
        if (token) {
          const { data } = await axios.get("https://timesavor-server.onrender.com/api/admin/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          dispatch({ 
            type: "INIT", 
            payload: { 
              isAuthenticated: true, 
              user: {
                name: data.admin.name,
                picture: data.admin.picture
              }
            }
          });
        } else {
          dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        dispatch({ type: "INIT", payload: { isAuthenticated: false, user: null } });
      }
    })();
  }, []);
  

  // SHOW LOADER
  if (!state.isInitialized) return <MatxLoading />;

  return (
    <AuthContext.Provider value={{
      ...state, 
      method: "JWT",
      login,
      logout,
      // register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;