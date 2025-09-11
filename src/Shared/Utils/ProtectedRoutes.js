import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export function ProtectedOutlet() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  
  if (isLoggedIn) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
}

export function PublicOutlet() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  console.log("isLoggedIn : ",isLoggedIn);


  useEffect(() => {
    if (isLoggedIn) {
      navigate("/fax-upload", { replace: true });
    }
  }, [isLoggedIn, navigate]);
  return !isLoggedIn ? <Outlet /> : null;
}
