import { useAuthContext } from "@/context/AuthProvider";
import React from "react";
import { Navigate } from "react-router-dom";

interface AuthProps {
  children: React.ReactNode;
}
const Auth: React.FC<AuthProps> = ({ children }) => {
  const { user } = useAuthContext();
  return <>{user ? children : <Navigate to={"/sign-in"} />}</>;
};

export default Auth;
