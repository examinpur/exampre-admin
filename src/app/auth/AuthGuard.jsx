import { Navigate, useLocation } from "react-router-dom";
// HOOK

export default function AuthGuard({ children }) {
  const authToken = localStorage.getItem('examAdminToken');
  const { pathname } = useLocation();

  if (authToken) return <>{children}</>;

  return <Navigate replace to="/session/signin" state={{ from: pathname }} />;
}
