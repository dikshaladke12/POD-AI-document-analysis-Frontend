import React from "react";
import { Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
// import Header from "../../Header/Header";
const PublicLayout = () => {
  return (
    <div className="wrapper">
      {/* <Header /> */}
      <div className="layout">
        <div className="outlet">
          <Outlet />
        </div>
      </div>
      {/* Footer */}
    </div>
  );
};

export default PublicLayout;
